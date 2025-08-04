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
  
  // 监听主题变化并保存到 localStorage
  watch(isDarkMode, (newValue) => {
    localStorage.setItem('theme-preference', newValue ? 'dark' : 'light')
  })

  // 切换主题的方法
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
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

  const totalPages = computed(() => Math.ceil(filteredPlugins.value.length / pageSize.value))

  const paginatedPlugins = computed(() => {
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
    // 重置到第一页
    currentPage.value = 1
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
    toggleTheme
  }
})
