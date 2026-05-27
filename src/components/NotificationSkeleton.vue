<template>
  <div class="notif-skeleton">
    <div class="skel skel-icon" />
    <div class="skel-body">
      <div class="skel skel-line skel-long" />
      <div class="skel skel-line skel-short" />
    </div>
  </div>
</template>

<style scoped>
.notif-skeleton {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: #ffffff;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 14px 16px;
}

@keyframes shimmer {
  0% {
    background-position: -400px 0;
  }
  100% {
    background-position: 400px 0;
  }
}

.skel {
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 800px 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

.skel-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  flex-shrink: 0;
}

.skel-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 4px;
}

.skel-line {
  height: 12px;
}

.skel-long {
  width: 80%;
}
.skel-short {
  width: 30%;
}
</style>
