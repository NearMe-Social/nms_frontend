<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

    <!-- Fake table header -->
    <div class="bg-gray-50 border-b border-gray-100 px-5 py-3.5 grid grid-cols-7 gap-4">
      <div v-for="n in 7" :key="n" class="h-3 bg-gray-200 rounded-full animate-pulse"></div>
    </div>

    <!-- Skeleton rows -->
    <div class="divide-y divide-gray-50">
      <div
        v-for="n in 6"
        :key="n"
        class="px-5 py-4 flex items-center gap-4"
        :style="{ animationDelay: `${n * 0.07}s` }"
      >
        <!-- ID -->
        <div class="w-12 h-3 bg-gray-100 rounded-full animate-pulse shrink-0"></div>

        <!-- Avatar + name -->
        <div class="flex items-center gap-2.5 w-36 shrink-0">
          <div class="w-7 h-7 rounded-full bg-gray-200 animate-pulse shrink-0"></div>
          <div class="h-3 bg-gray-100 rounded-full flex-1 animate-pulse"></div>
        </div>

        <!-- Type badge -->
        <div class="w-16 h-5 bg-gray-100 rounded-lg animate-pulse shrink-0"></div>

        <!-- Reason -->
        <div class="flex-1 h-3 bg-gray-100 rounded-full animate-pulse"></div>

        <!-- Status badge -->
        <div class="w-20 h-5 bg-gray-100 rounded-full animate-pulse shrink-0"></div>

        <!-- Date -->
        <div class="w-20 h-3 bg-gray-100 rounded-full animate-pulse shrink-0"></div>

        <!-- Action -->
        <div class="w-10 h-3 bg-gray-100 rounded-full animate-pulse shrink-0"></div>
      </div>
    </div>

    <!-- Footer skeleton -->
    <div class="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
      <div class="w-28 h-3 bg-gray-100 rounded-full animate-pulse"></div>
      <div class="flex gap-1">
        <div v-for="n in 3" :key="n" class="w-7 h-7 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    </div>

  </div>
</template>