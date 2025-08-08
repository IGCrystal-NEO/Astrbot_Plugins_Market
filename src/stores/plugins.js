import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'

export const usePluginStore = defineStore('plugins', () => {
  // 从 localStorage 获取主题偏好
  const savedTheme = localStorage.getItem('theme-preference')
  
  // 状态
  const plugins = ref(null)
  const searchQuery = ref('')
  const selectedTag = ref(null)
  const currentPage = ref(1)
  const pageSize = ref(12)
  const isDarkMode = ref(savedTheme === 'dark')
  const isLoading = ref(true)
  const sortBy = ref('default') // 默认使用原始顺序
  // 随机排序用的稳定种子，避免每次计算都重新打乱
  const randomSeed = ref(0)
  
  // 监听主题变化并保存到 localStorage
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('theme-preference', newValue ? 'dark' : 'light')
  })

  // 当排序方式改为随机时，生成一个新的种子（兼容 v-model 直接赋值场景）
  watch(sortBy, (value) => {
    if (value === 'random') {
      randomSeed.value = Math.random()
    }
  })

  // 切换主题的方法
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
  }

  // 简单稳定哈希：基于名字与种子生成稳定的“随机分数”
  function stableHash(input, seedNumber) {
    let h = (Math.floor(seedNumber * 1e9) ^ 5381) >>> 0
    for (let i = 0; i < input.length; i += 1) {
      h = (((h << 5) + h) + input.charCodeAt(i)) >>> 0 // h * 33 + c
    }
    return h >>> 0
  }

  // 计算属性
  const allTags = computed(() => {
    const tags = new Set()
    if (plugins.value) {
      plugins.value.forEach(plugin => {
        if (plugin.tags) {
          plugin.tags.forEach(tag => tags.add(tag))
        }
      })
    }
    return Array.from(tags).sort()
  })

  const tagOptions = computed(() => 
    allTags.value.map(tag => ({ label: tag, value: tag }))
  )

  const filteredPlugins = computed(() => {
    if (!plugins.value) return []
    
    let filtered = plugins.value.filter(plugin => {
      const searchValue = searchQuery.value ? searchQuery.value.toLowerCase() : ''
      if (!searchValue && !selectedTag.value) return true
      
      const matchesSearch = !searchValue || 
        (plugin.name && plugin.name.toLowerCase().includes(searchValue)) ||
        (plugin.desc && plugin.desc.toLowerCase().includes(searchValue)) ||
        (plugin.author && plugin.author.toLowerCase().includes(searchValue))
      
      const matchesTag = !selectedTag.value || 
        (Array.isArray(plugin.tags) && plugin.tags.includes(selectedTag.value))
      
      return matchesSearch && matchesTag
    })

    // 根据排序选项对结果进行排序
    if (sortBy.value === 'stars') {
      // 按照 stars 数量排序
      filtered.sort((a, b) => (b.stars || 0) - (a.stars || 0))
    } else if (sortBy.value === 'updated') {
      // 按照更新时间排序
      filtered.sort((a, b) => {
        const dateA = a.updated_at ? new Date(a.updated_at) : new Date(0)
        const dateB = b.updated_at ? new Date(b.updated_at) : new Date(0)
        return dateB - dateA
      })
    } else if (sortBy.value === 'random') {
      // 使用稳定的种子 + 名称哈希，避免每次响应式更新都抖动
      filtered.sort((a, b) => {
        const ha = stableHash(a.name || '', randomSeed.value)
        const hb = stableHash(b.name || '', randomSeed.value)
        return ha - hb
      })
    } else {
      // 默认使用原始顺序，不进行排序
      filtered.sort((a, b) => {
        const indexA = plugins.value.findIndex(p => p.name === a.name)
        const indexB = plugins.value.findIndex(p => p.name === b.name)
        return indexA - indexB
      })
    }

    return filtered
  })

  const totalPages = computed(() => {
    if (sortBy.value === 'random') {
      return filteredPlugins.value.length > 0 ? 1 : 0
    }
    return Math.ceil(filteredPlugins.value.length / pageSize.value)
  })

  const paginatedPlugins = computed(() => {
    if (sortBy.value === 'random') {
      // 随机排序仅展示一页，直接取前 pageSize 条
      return filteredPlugins.value.slice(0, pageSize.value)
    }
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredPlugins.value.slice(start, end)
  })

  // 动作
  async function loadPlugins() {
    isLoading.value = true
    try {
      const response = await axios.get('https://api.wenturc.com/astrbot/plugins/')
      const data = response.data
      plugins.value = Object.entries(data).map(([name, details]) => {
        // 确保 tags 始终是数组
        const tags = details.tags ? 
          (Array.isArray(details.tags) ? details.tags : [details.tags]) 
          : []
          
        return {
          name,
          ...details,
          tags
        }
      })
    } catch (error) {
      console.error('Error loading plugins:', error)
      plugins.value = []
    } finally {
      isLoading.value = false
    }
  }

  function setDarkMode(value) {
    isDarkMode.value = value
  }

  function setSearchQuery(query) {
    searchQuery.value = query
  }

  function setSelectedTag(tag) {
    selectedTag.value = tag
  }

  function setCurrentPage(page) {
    currentPage.value = page
  }

  function setSortBy(value) {
    sortBy.value = value
    // 随机排序时生成一次稳定种子，直到下次切换才变化
    if (value === 'random') {
      randomSeed.value = Math.random()
    }
    // 重置到第一页
    currentPage.value = 1
  }

  // 刷新随机顺序（保持当前为随机排序时生效）
  function refreshRandomOrder() {
    if (sortBy.value === 'random') {
      randomSeed.value = Math.random()
    }
  }

  return {
    // 状态
    plugins,
    searchQuery,
    selectedTag,
    currentPage,
    isDarkMode,
    sortBy,
    isLoading,
    randomSeed,
    // 计算属性
    allTags,
    tagOptions,
    filteredPlugins,
    totalPages,
    paginatedPlugins,
    // 动作
    loadPlugins,
    setDarkMode,
    setSearchQuery,
    setSelectedTag,
    setCurrentPage,
    setSortBy,
    toggleTheme,
    refreshRandomOrder
  }
})
