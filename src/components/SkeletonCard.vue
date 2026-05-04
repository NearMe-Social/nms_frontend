<template>
  <div class="skeleton-card" aria-hidden="true">
    <div class="skel skel-avatar" />
    <div class="skel-body">
      <div class="skel skel-name" />
      <div class="skel skel-dist" />
    </div>
    <div class="skel-bars">
      <div v-for="n in 4" :key="n" class="skel skel-bar" :style="`height: ${6 + n * 3}px`" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.025);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 14px 16px;
}

@keyframes shimmer {
  0% {
    background-position: -300px 0;
  }
  100% {
    background-position: 300px 0;
  }
}

.skeleton-card .skel-bar {
  animation: shimmer 1.5s infinite;
}
</style>
