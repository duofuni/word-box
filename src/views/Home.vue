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
      <!-- 标题区域 -->
      <div class="text-center mb-12 fade-in-up">
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
    </div>
  </div>
</template>

<script setup>
const baseUrl = import.meta.env.BASE_URL

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
];
</script>
