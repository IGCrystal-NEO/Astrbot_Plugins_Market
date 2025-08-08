<template>
  <div class="submit-plugin-page">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-content">
        <div class="header-left">
          <n-button quaternary circle @click="goBack">
            <template #icon>
              <n-icon><arrow-back /></n-icon>
            </template>
          </n-button>
          <h1>提交插件到市场</h1>
        </div>
        <div class="header-right">
          <n-button quaternary circle @click="toggleTheme">
            <template #icon>
              <n-icon>
                <moon v-if="isDarkMode" />
                <sunny v-else />
              </n-icon>
            </template>
          </n-button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="main-content">
      <div class="content-container">
        <!-- 左侧表单区 -->
        <section class="form-section">
          <n-card title="插件信息" class="form-card">
            <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top" require-mark-placement="right-hanging">
              <n-form-item label="插件名称" path="name">
                <n-input 
                  v-model:value="formData.name" 
                  placeholder="请输入插件名称"
                  @input="generateJSON"
                />
              </n-form-item>
              
              <n-form-item label="插件描述" path="desc">
                <n-input 
                  v-model:value="formData.desc" 
                  type="textarea" 
                  placeholder="详细描述插件的功能和特点"
                  :autosize="{ minRows: 3, maxRows: 5 }"
                  @input="generateJSON"
                />
              </n-form-item>
              
              <n-form-item label="作者" path="author">
                <n-input 
                  v-model:value="formData.author" 
                  placeholder="请输入作者名称"
                  @input="generateJSON"
                />
              </n-form-item>
              
                             <n-form-item label="仓库地址" path="repo">
                 <n-input 
                   v-model:value="formData.repo" 
                   placeholder="https://github.com/username/repository"
                   @input="generateJSON"
                 />
               </n-form-item>
               
               <n-form-item label="标签（按回车添加）" path="tags">
                <n-dynamic-tags v-model:value="formData.tags" @update:value="generateJSON" />
              </n-form-item>
              
              <n-form-item label="社交链接（可选）" path="social_link">
                <n-input 
                  v-model:value="formData.social_link" 
                  placeholder="个人主页、Twitter、博客等"
                  @input="generateJSON"
                />
              </n-form-item>
            </n-form>
          </n-card>
        </section>

        <!-- 右侧预览和提交区 -->
        <section class="preview-section">
          <!-- JSON 预览 -->
          <n-card title="JSON 预览" class="json-card">
            <template #header-extra>
              <n-button 
                @click="copyJSON" 
                type="primary" 
                ghost 
                :disabled="!generatedJSON"
                size="small"
              >
                <template #icon>
                  <n-icon><copy /></n-icon>
                </template>
                复制
              </n-button>
            </template>
            <div class="json-content">
              <n-code
                :code="generatedJSON || '请填写左侧表单信息，JSON将自动生成'"
                language="json"
                :word-wrap="true"
              />
            </div>
          </n-card>

          <!-- 提交指南 -->
          <n-card title="提交指南" class="guide-card">
            <div class="guide-content">
              <n-steps vertical :current="submissionStep" size="small">
                <n-step title="填写完整信息">
                  <div class="step-desc">确保所有必填字段都已填写完整</div>
                </n-step>
                <n-step title="复制JSON数据">
                  <div class="step-desc">点击上方"复制"按钮复制生成的JSON</div>
                </n-step>
                <n-step title="提交到GitHub">
                  <div class="step-desc">在GitHub Issue中粘贴JSON并提交</div>
                </n-step>
              </n-steps>
              
              <div class="submit-actions">
                <n-button 
                  type="primary" 
                  :disabled="!isFormValid"
                  @click="submitToGitHub"
                  block
                  size="large"
                >
                  <template #icon>
                    <n-icon><logo-github /></n-icon>
                  </template>
                  提交到 GitHub
                </n-button>
                
                <div class="tip-text">
                  <n-icon><information-circle /></n-icon>
                  将在新窗口打开GitHub Issue页面
                </div>
              </div>
            </div>
          </n-card>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { 
  NForm, 
  NFormItem, 
  NInput, 
  NButton,
  NDynamicTags,
  NCard,
  NIcon,
  NCode,
  NSteps,
  NStep,
  useMessage
} from 'naive-ui'
import { 
  ArrowBack, 
  Copy,
  Moon,
  Sunny,
  LogoGithub,
  InformationCircle
} from '@vicons/ionicons5'
import { usePluginStore } from '@/stores/plugins'

const router = useRouter()
const message = useMessage()
const store = usePluginStore()
const formRef = ref(null)
const generatedJSON = ref('')

// 操作状态跟踪
const actionStates = reactive({
  copied: false,
  submitted: false
})

// 从 store 中获取暗色模式状态
const { isDarkMode } = storeToRefs(store)

// 切换主题
const toggleTheme = () => {
  store.toggleTheme()
}

// 表单数据
const formData = reactive({
  name: '',
  desc: '',
  author: '',
  repo: '',
  tags: [],
  social_link: ''
})

// 表单验证规则
const rules = {
  name: {
    required: true,
    message: '请输入插件名称',
    trigger: 'blur'
  },
  desc: {
    required: true,
    message: '请输入插件描述',
    trigger: 'blur'
  },
  author: {
    required: true,
    message: '请输入作者名称',
    trigger: 'blur'
  },
  repo: {
    required: true,
    validator: (rule, value) => {
      if (!value) {
        return new Error('请输入仓库地址')
      }
      if (!/^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/.test(value)) {
        return new Error('请输入有效的GitHub仓库地址')
      }
      return true
    },
    trigger: 'blur'
  }
}

// 计算属性：表单是否有效
const isFormValid = computed(() => {
  return formData.name && 
         formData.desc && 
         formData.author && 
         formData.repo && 
         /^https:\/\/github\.com\/[\w-]+\/[\w-]+\/?$/.test(formData.repo)
})

// 计算属性：提交步骤
const submissionStep = computed(() => {
  if (!isFormValid.value) return 1
  if (!actionStates.copied) return 2
  return 3
})

// 生成JSON
const generateJSON = () => {
  if (!isFormValid.value) {
    generatedJSON.value = ''
    return
  }
  
  const jsonData = {
    name: formData.name,
    desc: formData.desc,
    author: formData.author,
    repo: formData.repo.replace(/\/$/, ''), // 移除末尾斜杠
    tags: formData.tags,
    ...(formData.social_link && { social_link: formData.social_link }),
    stars: 0 // 默认星数
  }
  
  generatedJSON.value = JSON.stringify(jsonData, null, 2)
}

// 复制JSON
const copyJSON = async () => {
  if (!generatedJSON.value) {
    message.warning('请先填写完整信息生成JSON')
    return
  }
  
  try {
    await navigator.clipboard.writeText(generatedJSON.value)
    message.success('JSON已复制到剪贴板！')
    actionStates.copied = true // 标记已复制
  } catch (err) {
    message.error('复制失败，请手动复制')
  }
}

// 提交到GitHub
const submitToGitHub = async () => {
  // 先验证表单
  try {
    await formRef.value?.validate()
  } catch {
    message.error('请完善必填信息')
    return
  }
  
  // 自动复制JSON
  await copyJSON()
  
  // 打开GitHub Issue
  const issueUrl = 'https://github.com/AstrBotDevs/AstrBot/issues/new?template=PLUGIN_PUBLISH.yml'
  window.open(issueUrl, '_blank')
  actionStates.submitted = true // 标记已提交
  
  message.info('请在打开的GitHub页面中粘贴JSON数据')
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 监听表单数据变化，自动生成JSON
watch(formData, generateJSON, { deep: true })

// 监听表单数据变化，重置操作状态
watch(formData, () => {
  actionStates.copied = false
  actionStates.submitted = false
}, { deep: true })
</script>

<style scoped>
.submit-plugin-page {
  min-height: 100vh;
  background: var(--bg-base);
  display: flex;
  flex-direction: column;
}

.page-header {
  background: var(--bg-card);
  border-bottom: 1px solid var(--border-base);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h1 {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.main-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 24px;
  align-items: stretch; /* 让左右两列高度一致 */
}

.form-section {
  min-width: 0; /* 防止flex子项溢出 */
  display: flex;
  flex-direction: column;
}

.preview-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: sticky;
  top: 100px; /* 距离顶部的距离 */
}

.form-card {
  border-radius: 12px;
  border: 1px solid var(--border-base);
  height: fit-content; /* 根据内容自适应高度，不拉伸 */
}

.json-card,
.guide-card {
  border-radius: 12px;
  border: 1px solid var(--border-base);
}

/* 让表单内容区域自动填充 */
.form-card :deep(.n-card__content) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 让表单本身也不要有多余空间 */
.form-card :deep(.n-form) {
  flex: 0 0 auto; /* 不拉伸，按内容大小 */
}

.json-content {
  max-height: 300px;
  overflow-y: auto;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step-desc {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.submit-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.tip-text {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-tertiary);
  text-align: center;
  justify-content: center;
}

/* 表单项样式优化 */
:deep(.n-form-item) {
  margin-bottom: 16px;
}

:deep(.n-form-item-label) {
  font-weight: 500;
  color: var(--text-primary);
}

/* 去掉表单项反馈区域的间隙 */
:deep(.n-form-item-feedback-wrapper) {
  min-height: 0 !important;
  padding: 0 !important;
  margin: 0 !important;
}

:deep(.n-form-item-feedback) {
  padding: 0 !important;
  margin: 0 !important;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .content-container {
    grid-template-columns: 1fr 350px;
    gap: 20px;
  }
  
  .preview-section {
    position: static;
  }
}

@media (max-width: 768px) {
  .content-container {
    grid-template-columns: 1fr;
    gap: 16px;
    align-items: start; /* 移动端不需要拉伸高度 */
  }
  
  .main-content {
    padding: 16px;
  }
  
  .header-content {
    padding: 12px 16px;
  }
  
  .header-left h1 {
    font-size: 18px;
  }
  
  .form-section {
    order: 1; /* 表单第一个 */
  }
  
  .preview-section {
    order: 2; /* 整个预览区域第二个 */
    position: static; /* 移动端取消粘性定位 */
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 12px;
  }
  
  .header-content {
    padding: 12px;
  }
}

/* 动画效果 */
.form-card,
.json-card,
.guide-card {
  animation: slideInUp 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮悬停效果 */
.n-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.n-button:hover {
  transform: translateY(-1px);
}

.n-button:active {
  transform: translateY(0);
}
</style>