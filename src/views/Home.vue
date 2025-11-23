<template>
  <div
    class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
    style="background-color: #F8F5F0;"
  >
    <!-- 半透明欧式雕塑背景 -->
    <div
      class="absolute inset-0 pointer-events-none z-0"
      :style="{
        backgroundImage: `url(${baseUrl}apollo-bust.jpg), url(${baseUrl}apollo-bust-long.jpg)`,
        backgroundSize: '110% auto, 100% 50%',
        backgroundPosition: '-16px 9%, center bottom',
        backgroundRepeat: 'no-repeat, no-repeat',
        opacity: 0.3,
      }"
    ></div>

      <div class="max-w-4xl w-full relative z-10">
      <!-- 设置按钮 -->
      <div class="absolute top-0 right-0 z-20">
        <button
          @click="showSettings = true"
          class="w-10 h-10 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110"
          title="设置"
        >
          <svg
            class="w-5 h-5 text-gray-700"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
      </div>

      <!-- 标题区域 -->
      <div class="text-center mb-8 fade-in-up">
        <div class="inline-block mb-4 ornamental-border">
          <h1
            class="text-4xl font-bold mb-0 relative"
            style="font-size: 36px; font-family: 'Playfair Display', serif;"
          >
            <span class="gold-gradient">词汇盒子</span>
          </h1>
        </div>
        <p
          class="text-base font-medium fade-in-up-delay"
          style="
            font-family: 'Inter', sans-serif;
            color: #5C4033;
            font-size: 16px;
          "
        >
          选择学习模式，开始你的单词之旅
        </p>
      </div>

      <!-- 当前词库区域 -->
      <div class="mb-6 fade-in-up-delay">
        <div
          class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
          style="background-color: rgba(255, 255, 255, 0.9);"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3 flex-1">
              <div class="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-sm text-gray-600 mb-1" style="font-family: 'Inter', sans-serif;">
                  当前词库
                </div>
                <div
                  v-if="vocabInfo"
                  class="text-lg font-bold text-gray-800 truncate"
                  style="font-family: 'Inter', sans-serif;"
                >
                  {{ vocabInfo.vocabulary.name }}
                </div>
                <div
                  v-else
                  class="text-lg font-bold text-gray-500"
                  style="font-family: 'Inter', sans-serif;"
                >
                  暂未选择词库
                </div>
              </div>
            </div>
            <router-link
              to="/word-select"
              class="px-4 py-2 bg-white rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
              style="font-family: 'Inter', sans-serif;"
            >
              切换 >
            </router-link>
          </div>
        </div>
      </div>

      <!-- 快速开始按钮 -->
      <div class="mb-8 fade-in-up-delay">
        <button
          @click="quickStart"
          :disabled="!vocabInfo"
          class="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-500 rounded-2xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          style="font-family: 'Inter', sans-serif;"
        >
          <div class="flex items-center justify-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            快速开始
          </div>
        </button>
      </div>

      <!-- 功能卡片区域 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <router-link
          v-for="(module, index) in modules"
          :key="module.name"
          :to="module.route"
          :class="[
            'vintage-card-hover vintage-border vintage-texture rounded-lg p-8 opacity-70',
            `fade-in-up-delay-${index}`
          ]"
          style="background-color: #FAF8F3;"
        >
          <div class="flex flex-col items-start">
            <!-- 复古图标 -->
            <div class="mb-4 text-[#5C4033]">
              <svg
                v-if="module.iconType === 'book'"
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
              <svg
                v-else-if="module.iconType === 'gramophone'"
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z"
                />
              </svg>
              <svg
                v-else-if="module.iconType === 'link'"
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <svg
                v-else-if="module.iconType === 'eye'"
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <svg
                v-else-if="module.iconType === 'chart'"
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <svg
                v-else
                class="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                stroke-width="1.5"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>

            <!-- 标题和说明 -->
            <h3
              class="text-2xl font-bold mb-2"
              style="
                font-family: 'Playfair Display', serif;
                color: #5C4033;
              "
            >
              {{ module.title }}
            </h3>
            <p
              class="text-sm"
              style="
                font-family: 'Inter', sans-serif;
                color: #6B6B6B;
                font-size: 14px;
              "
            >
              {{ module.description }}
            </p>
          </div>
        </router-link>
      </div>

      <!-- 底部导航按钮 -->
      <div class="mt-8 grid grid-cols-3 gap-3 fade-in-up-delay">
        <router-link
          to="/word-select"
          class="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style="background-color: rgba(255, 255, 255, 0.9);"
        >
          <div class="flex flex-col items-center gap-2">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span class="text-xs font-medium text-gray-700" style="font-family: 'Inter', sans-serif;">
              选择词库
            </span>
          </div>
        </router-link>
        
        <button
          class="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style="background-color: rgba(255, 255, 255, 0.9);"
          @click="showWrongWords"
        >
          <div class="flex flex-col items-center gap-2">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-xs font-medium text-gray-700" style="font-family: 'Inter', sans-serif;">
              错题词库
            </span>
          </div>
        </button>
        
        <button
          class="bg-white/90 backdrop-blur-sm rounded-xl p-4 text-center shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95"
          style="background-color: rgba(255, 255, 255, 0.9);"
          @click="showMyWords"
        >
          <div class="flex flex-col items-center gap-2">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span class="text-xs font-medium text-gray-700" style="font-family: 'Inter', sans-serif;">
              我的词库
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- 设置弹窗 -->
    <SettingsModal :isOpen="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useVocabulary } from '../composables/useVocabulary'
import { useBackgroundMusic } from '../composables/useBackgroundMusic'
import SettingsModal from '../components/SettingsModal.vue'

const baseUrl = import.meta.env.BASE_URL
const router = useRouter()
const { getSelectedVocabularyInfo, hasSelectedVocabulary } = useVocabulary()
const { initAudio, loadMusicSettings, saveMusicSettings } = useBackgroundMusic()

const vocabInfo = ref(null)
const showSettings = ref(false)

// 初始化音乐（App.vue 已经初始化了，这里只是确保设置加载）
onMounted(async () => {
  // App.vue 已经初始化了音频，这里只需要加载设置
  await loadMusicSettings()
  // Load vocabulary info
  vocabInfo.value = await getSelectedVocabularyInfo()
})

// 页面卸载时保存设置
onBeforeUnmount(() => {
  saveMusicSettings()
})

const modules = [
  {
    name: "flashcard",
    title: "单词闪卡",
    description: "点击查看单词，学习单词含义",
    route: "/word-flashcard",
    iconType: "book",
  },
  {
    name: "memory",
    title: "单词记忆",
    description: "匹配单词和中文，消除所有卡片",
    route: "/word-memory",
    iconType: "gramophone",
  },
  {
    name: "link",
    title: "单词连线",
    description: "点击单词和中文进行连线匹配",
    route: "/word-link",
    iconType: "link",
  },
  {
    name: "spot",
    title: "单词找茬",
    description: "找到颜色不一样的方块，挑战你的眼力",
    route: "/word-spot",
    iconType: "eye",
  },
  {
    name: "quiz",
    title: "单词测验",
    description: "通过答题将数字减到零，挑战你的单词记忆",
    route: "/word-quiz",
    iconType: "chart",
  },
  {
    name: "eliminate",
    title: "单词消除",
    description: "点击匹配单词和含义进行消除，挑战你的反应速度",
    route: "/word-eliminate",
    iconType: "chart",
  },
  {
    name: "wordstack",
    title: "词了个词",
    description: "消除三层单词，匹配三个相同单词即可消除，挑战你的策略",
    route: "/word-stack",
    iconType: "chart",
  },
];

const quickStart = () => {
  if (vocabInfo.value) {
    // Randomly select a game module
    const randomModule = modules[Math.floor(Math.random() * modules.length)]
    router.push(randomModule.route)
  }
}

const showWrongWords = () => {
  // TODO: Implement wrong words vocabulary
  alert('错题词库功能开发中...')
}

const showMyWords = () => {
  // TODO: Implement my words vocabulary
  alert('我的词库功能开发中...')
}
</script>
