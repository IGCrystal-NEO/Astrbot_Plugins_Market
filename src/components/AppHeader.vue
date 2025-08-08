<template>
  <header class="app-header">
    <!-- 背景装饰元素 -->
    <div class="header-bg-decoration">
      <div class="floating-circle circle-1"></div>
      <div class="floating-circle circle-2"></div>
      <div class="floating-circle circle-3"></div>
    </div>
    
    <n-space justify="end" style="padding: 16px">
      <n-switch 
        :value="modelValue" 
        @update:value="handleThemeChange"
        :rail-style="railStyle"
        :aria-label="modelValue ? '切换到浅色主题' : '切换到深色主题'"
        :aria-checked="modelValue"
        role="switch"
      >
        <template #checked>
          <n-icon aria-hidden="true"><moon-sharp /></n-icon>
        </template>
        <template #unchecked>
          <n-icon aria-hidden="true"><sunny-sharp /></n-icon>
        </template>
      </n-switch>
    </n-space>
    <div class="header-title">
      <img src="/logo.webp" alt="Astrbot Logo" class="header-logo" width="48" height="48">
      <div class="title-wrapper">
        <h1>Astrbot 插件市场</h1>
      </div>
    </div>
    <search-toolbar
      :search-query="searchQuery"
      :current-page="currentPage"
      :sort-by="sortBy"
      @update:search-query="handleSearchQueryChange"
      @update:current-page="handleCurrentPageChange"
      @update:sort-by="handleSortByChange"
    />
  </header>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { NSpace, NSwitch, NIcon } from 'naive-ui'
import { MoonSharp, SunnySharp } from '@vicons/ionicons5'
import SearchToolbar from './SearchToolbar.vue'

const props = defineProps({
  modelValue: Boolean,
  searchQuery: String,
  currentPage: Number,
  totalPages: Number,
  sortBy: String
})

const emit = defineEmits([
  'update:modelValue',
  'update:searchQuery',
  'update:currentPage',
  'update:sortBy',
  'update:sort-by'
])

const handleThemeChange = (value) => {
  emit('update:modelValue', value)
}

const handleSearchQueryChange = (value) => {
  emit('update:searchQuery', value)
}

const handleCurrentPageChange = (value) => {
  emit('update:currentPage', value)
}

const handleSortByChange = (value) => {
  emit('update:sortBy', value)
  emit('update:sort-by', value)
}

const railStyle = ({ focused, checked }) => {
  const style = {}
  if (checked) {
    style.background = '#1e293b'
  } else {
    style.background = '#60a5fa'
  }
  if (focused) {
    style.boxShadow = '0 0 0 2px rgba(96, 165, 250, 0.3)'
  }
  return style
}

onMounted(() => {
  // 移除了下拉菜单样式的动态更新
})
</script>

<style scoped>
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

@keyframes circle-appear {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes content-fade-up {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes header-slide-down {
  0% {
    clip-path: inset(0 0 100% 0 round 0 0 32px 32px);
    transform: translateY(-20px);
  }
  100% {
    clip-path: inset(0 0 0 0 round 0 0 32px 32px);
    transform: translateY(0);
  }
}

.app-header {
  text-align: center;
  margin-bottom: 40px;
  padding: 32px 20px;
  background: var(--header-gradient);
  border-radius: 0 0 32px 32px;
  position: relative;
  overflow: hidden;
  animation: header-slide-down 0.6s cubic-bezier(0.33, 1, 0.68, 1) forwards;
  transform-origin: top;
  will-change: transform, clip-path;
  contain: paint layout;
}

.app-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--header-overlay);
  pointer-events: none;
}

/* 背景装饰 */
.header-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 1;
}

.floating-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  opacity: 0;
}

.circle-1 {
  width: 200px;
  height: 200px;
  top: -100px;
  right: -50px;
  animation: 
    float 6s ease-in-out infinite,
    circle-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.5s;
  will-change: transform, opacity;
}

.circle-2 {
  width: 150px;
  height: 150px;
  bottom: -40px;  /* 调整位置，确保不会超出圆角 */
  left: 20px;     /* 向右移动，避免超出左侧 */
  animation: 
    float 8s ease-in-out infinite reverse,
    circle-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.6s;
  will-change: transform, opacity;
}

.circle-3 {
  width: 100px;
  height: 100px;
  top: 50%;
  right: 10%;
  animation: 
    pulse 4s ease-in-out infinite,
    circle-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards 0.7s;
  will-change: transform, opacity;
}

.header-title {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 35px;
  gap: 16px;
  position: relative;
  z-index: 2;
  animation: content-fade-up 0.5s cubic-bezier(0.33, 1, 0.68, 1) forwards 0.4s;
  opacity: 0;
  will-change: transform, opacity;
}

.header-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  transform-origin: center;
}

.title-wrapper {
  display: flex;
  align-items: center;
  height: 48px;  /* 与 logo 高度一致 */
}

@font-face {
  font-family: 'Lexend';
  src: url('/font/lexend.woff2') format('woff2');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Lexend';
  src: url('/font/lexend-v25-latin-600.woff2') format('woff2');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

.app-header h1 {
  margin: 0;
  color: var(--header-text-color);
  font-size: 2.75em;
  font-weight: 600;
  letter-spacing: -0.5px;
  transition: color 0.3s ease; /* 避免影响布局的属性动画 */
  font-family: 'Lexend', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 主题切换按钮样式 */
:deep(.n-switch) {
  --n-button-color: #fff;
  --n-button-box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  --n-loading-color: var(--primary-color);
  width: 50px !important;
  height: 24px !important;
  position: relative;
  z-index: 3;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

:deep(.n-switch .n-switch__rail) {
  height: 24px !important;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

:deep(.n-switch .n-switch__button) {
  height: 20px !important;
  width: 20px !important;
  top: 2px !important;
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}

:deep(.n-switch .n-switch__button-icon) {
  font-size: 14px;
  color: var(--primary-color);
  will-change: transform;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

/* ===== 响应式设计优化 ===== */

/* 平板设备 (768px - 1024px) */
@media (max-width: 1024px) and (min-width: 769px) {
  .app-header {
    padding: 28px 18px;
  }
  
  .app-header h1 {
    font-size: 2.4em;
  }
  
  .header-title {
    gap: 14px;
  }
  
  .header-logo {
    width: 54px;
    height: 54px;
  }
  
  .title-wrapper {
    height: 54px;
  }
}

/* 平板和手机通用样式 (最大 768px) */
@media (max-width: 768px) {
  .app-header {
    margin-bottom: 24px;
    padding: 20px 16px;
    border-radius: 0 0 24px 24px;
  }

  .search-container {
    max-width: 90%;
    margin: 0 auto 12px;
  }
  
  .circle-1 {
    width: 120px;
    height: 120px;
    top: -60px;
    right: -30px;
  }
  
  .circle-2 {
    width: 100px;
    height: 100px;
    bottom: -50px;
    left: -20px;
  }
  
  .circle-3 {
    width: 80px;
    height: 80px;
  }
}

/* 仅手机设备 (最大 480px) */
@media (max-width: 480px) {
  .app-header {
    margin-bottom: 24px;
    padding: 20px 16px;
    border-radius: 0 0 24px 24px;
  }
  
  /* 标题区域优化 */
  .header-title {
    flex-direction: column;
    gap: 12px;
    margin-bottom: 24px;
  }
  
  .header-logo {
    width: 55px;
    height: 55px;
    order: -1; /* logo 在上方 */
  }

  .title-wrapper {
    height: auto;
    text-align: center;
  }
  
  .app-header h1 {
    font-size: 1.8em;
    line-height: 1.3;
    letter-spacing: -0.3px;
  }
  
  /* 分页优化 */
  .top-pagination-wrapper {
    padding: 0 12px;
    margin-bottom: 16px;
  }
  
  :deep(.top-pagination-wrapper .n-pagination) {
    gap: 4px;
    flex-wrap: wrap;
    justify-content: center;
  }
  
  :deep(.top-pagination-wrapper .n-pagination-item) {
    min-width: 32px !important;
    height: 32px !important;
    font-size: 13px !important;
    border-radius: 6px !important;
    /* 增强在深色背景下的可见性 */
    background-color: rgba(255, 255, 255, 0.12) !important;
    backdrop-filter: blur(12px) !important;
  }
  
  /* 隐藏部分页码，只显示当前页附近的页码 */
  :deep(.n-pagination .n-pagination-item:not(.n-pagination-item--active):not(.n-pagination-item--button):not(.n-pagination-item.n-pagination-item--disabled)) {
    display: none;
  }
  
  /* 确保显示第一页和最后一页 */
  :deep(.n-pagination .n-pagination-item:first-of-type),
  :deep(.n-pagination .n-pagination-item:last-of-type) {
    display: flex !important;
  }
  
  :deep(.top-pagination-wrapper .n-pagination-item--active) {
    background-color: rgba(255, 255, 255, 0.3) !important;
  }
  
  :deep(.top-pagination-wrapper .n-pagination-item--button) {
    padding: 0 8px !important;
    font-weight: 600 !important;
  }
  
  /* 页码信息在小屏幕下调整 */
  :deep(.top-pagination-wrapper .n-pagination-prefix),
  :deep(.top-pagination-wrapper .n-pagination-suffix) {
    font-size: 12px !important;
    margin: 0 4px !important;
    order: 10;
    width: 100%;
    text-align: center;
    margin-top: 8px !important;
    opacity: 0.9;
    background: rgba(255, 255, 255, 0.1);
    padding: 4px 8px;
    border-radius: 12px;
    backdrop-filter: blur(8px);
  }
  
  /* 主题切换按钮优化 */
  :deep(.n-switch) {
    width: 46px !important;
    height: 22px !important;
  }
  
  :deep(.n-switch .n-switch__rail) {
    height: 22px !important;
  }
  
  :deep(.n-switch .n-switch__button) {
    height: 18px !important;
    width: 18px !important;
    top: 2px !important;
  }
  
  :deep(.n-switch .n-switch__button-icon) {
    font-size: 12px;
  }
  
  .circle-1, .circle-2 {
    display: none;
  }
  
  .circle-3 {
    width: 60px;
    height: 60px;
  }
}

/* 小屏手机设备 (最大 480px) */
@media (max-width: 480px) {
  .app-header {
    padding: 16px 12px;
    border-radius: 0 0 20px 20px;
  }
  
  .app-header h1 {
    font-size: 1.6em;
    word-break: keep-all; /* 防止中文换行 */
  }
  
  .header-logo {
    width: 60px;
    height: 60px;
  }
}

/* 超小屏幕设备 (最大 360px) */
@media (max-width: 360px) {
  .app-header {
    padding: 14px 10px;
  }
  
  .app-header h1 {
    font-size: 1.4em;
  }
  
  .header-logo {
    width: 50px;
    height: 50px;
  }
}

/* 横屏模式优化 (高度较小的设备) */
@media (max-height: 500px) and (orientation: landscape) {
  .app-header {
    padding: 12px 16px;
    margin-bottom: 16px;
  }
  
  .header-title {
    margin-bottom: 16px;
    gap: 8px;
  }
  
  .app-header h1 {
    font-size: 1.5em;
  }
  
  .header-logo {
    width: 32px;
    height: 32px;
  }
}

/* 触摸设备优化 */
@media (hover: none) and (pointer: coarse) {
  /* 增加触摸目标大小 */
  :deep(.n-switch) {
    min-width: 50px !important;
    min-height: 30px !important;
  }
}

/* 高分辨率屏幕优化 */
@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi) {
  .header-logo {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: crisp-edges;
  }
}

/* 暗色主题适配 */
:global(.dark) .floating-circle {
  background: rgba(90, 155, 212, 0.1);
}
</style>