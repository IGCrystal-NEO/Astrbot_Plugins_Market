<template>
  <n-layout class="main-layout">
    <app-header
      v-model="isDarkMode"
      v-model:search-query="searchQuery"
      v-model:selected-tag="selectedTag"
      v-model:current-page="currentPage"
      v-model:sort-by="sortBy"
      :tag-options="tagOptions"
      :total-pages="totalPages"
    />
    <div class="top-pagination-wrapper">
      <app-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :total-pages="totalPages"
        class="top-pagination"
      />
    </div>

    <!-- 随机排序时的工具条 -->
    <div v-if="sortBy === 'random'" class="grid-toolbar">
      <div class="grid-toolbar-inner">
        <span class="toolbar-tip">随机推荐</span>
        <n-button size="small" tertiary @click="refreshRandomOrder">
          <template #icon>
                         <n-icon><sync-outline /></n-icon>
          </template>
          换一换
        </n-button>
      </div>
    </div>

    <main class="plugins-grid">
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="custom-loading">
          <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
          <div class="loading-text">正在加载插件数据</div>
        </div>
      </div>
      
      <!-- 空状态提示 -->
      <div v-else-if="!isLoading && filteredPlugins.length === 0" class="empty-state">
        <div class="empty-icon">
          <n-icon size="48" :component="SearchOutline" />
        </div>
        <h3 class="empty-title">没有找到相关插件哦</h3>
        <p class="empty-description">
          <span v-if="searchQuery || selectedTag">
            试试调整搜索内容呢
          </span>
          <span v-else>
            当前没有可用的插件数据
          </span>
        </p>
      </div>
      
      <!-- 插件卡片 -->
      <template v-else>
        <plugin-card
          v-for="(plugin, index) in paginatedPlugins"
          :key="`${plugin.name}-${filterKey}-${randomSeed}`"
          :plugin="plugin"
          :index="index"
          :seed="randomSeed"
        />
      </template>
    </main>
    <div class="bottom-pagination-wrapper">
      <app-pagination
        v-if="totalPages > 1"
        v-model="currentPage"
        :total-pages="totalPages"
      />
    </div>
    <app-footer />
  </n-layout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { NLayout, NSpin, NIcon, NButton } from 'naive-ui'
import { SearchOutline, SyncOutline } from '@vicons/ionicons5'
import AppHeader from '../components/AppHeader.vue'
import PluginCard from '../components/PluginCard.vue'
import AppPagination from '../components/AppPagination.vue'
import AppFooter from '../components/AppFooter.vue'
import { usePluginStore } from '../stores/plugins'

const store = usePluginStore()

// 从store中获取状态
const { 
  isDarkMode,
  searchQuery,
  selectedTag,
  currentPage,
  sortBy,
  tagOptions,
  totalPages,
  paginatedPlugins,
  isLoading,
  filteredPlugins,
  randomSeed
} = storeToRefs(store)

// 计算属性
const filterKey = computed(() => {
  return `${searchQuery.value}-${selectedTag.value}-${sortBy.value}-${currentPage.value}`
})

// 动作
const { refreshRandomOrder } = store

// 生命周期钩子
onMounted(() => {
  store.loadPlugins()
})
</script>

<style scoped>
.main-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.top-pagination-wrapper,
.bottom-pagination-wrapper {
  min-height: 48px; /* 占位，避免分页出现/消失造成位移 */
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 工具栏与卡片对齐 */
.grid-toolbar {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
}
.grid-toolbar-inner {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding: 4px 0 8px;
}
.toolbar-tip {
  color: var(--text-tertiary);
  font-size: 13px;
}

  .plugins-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
    max-width: 1400px;
    gap: 24px;
    padding: 20px;
    margin: 0 auto;
    animation: gridAppear 0.3s ease-out;
    animation-delay: 0.7s;
    animation-fill-mode: backwards;
    align-content: start;  /* 防止行被拉伸填满容器高度 */
    align-items: start;    /* 防止卡片在行内被拉伸增高 */
  }

@keyframes gridAppear {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 平板和中等屏幕 */
@media (max-width: 1024px) and (min-width: 769px) {
  .plugins-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 18px;
  }
}

/* 小平板屏幕 */
@media (max-width: 768px) and (min-width: 481px) {
  .plugins-grid {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 18px;
    padding: 16px;
  }
}

/* 手机屏幕 */
@media (max-width: 480px) {
  .plugins-grid {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }
}

/* 限制单个卡片的最大宽度，防止占据整行 */
.plugins-grid > * {
  max-width: 500px;
  justify-self: center;
}

.loading-container {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh; /* 占位，避免加载完成时大幅推移页脚 */
  padding-top: 0;
}

.custom-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: dotPulse 1.4s ease-in-out infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

.dot:nth-child(3) {
  animation-delay: 0s;
}

@keyframes dotPulse {
  0%, 80%, 100% {
    transform: scale(0.6);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: 16px;
  color: var(--text-secondary);
  font-weight: 500;
  opacity: 0.8;
  animation: fadeInOut 2s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% {
    opacity: 0.5;
  }
  50% {
    opacity: 0.9;
  }
}

/* 确保加载动画流畅恒定 */
.loading-container :deep(.n-spin) {
  will-change: transform;
  transform: translateZ(0); /* 启用硬件加速 */
}

.loading-container :deep(.n-spin-icon) {
  animation-timing-function: linear !important; /* 强制线性动画 */
  animation-duration: 1s !important; /* 固定动画时长 */
  will-change: transform;
  transform: translateZ(0); /* 启用硬件加速 */
}

.loading-container :deep(.n-spin-body) {
  will-change: auto;
}

.empty-state {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  min-height: 300px;
  padding-top: 80px;
  text-align: center;
  color: var(--text-color-2);
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.6;
  color: var(--text-color-3);
}

.empty-title {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-color-1);
}

.empty-description {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-2);
  opacity: 0.8;
}
</style>
