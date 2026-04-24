<script setup lang="ts">
import type { NearbyUser } from '@/stores/nearbyStore'

defineProps<{ user: NearbyUser }>()

function formatDistance(meters: number): string {
  if (meters < 1000) return `~${meters}m away`
  return `~${(meters / 1000).toFixed(1)}km away`
}

function distanceClass(meters: number): string {
  if (meters <= 50) return 'dist-very-close'
  if (meters <= 200) return 'dist-close'
  if (meters <= 500) return 'dist-near'
  return 'dist-far'
}

function avatarHue(username: string): number {
  let hash = 0
  for (const ch of username) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffffffff
  return Math.abs(hash) % 360
}

function signalBars(meters: number): number {
  if (meters <= 50) return 4
  if (meters <= 150) return 3
  if (meters <= 400) return 2
  return 1
}
</script>

<template>
  <article class="user-card" :class="distanceClass(user.distance_m)">
    <div class="avatar" :style="`--hue: ${avatarHue(user.username)}`">
      <div class="avatar-initials">{{ user.username.slice(0, 2).toUpperCase() }}</div>
      <div class="avatar-ring" />
    </div>

    <div class="card-body">
      <p class="username">{{ user.username }}</p>
      <p class="distance">{{ formatDistance(user.distance_m) }}</p>
    </div>

    <div class="signal-strength">
      <span
        v-for="n in 4"
        :key="n"
        class="bar"
        :class="{ lit: n <= signalBars(user.distance_m) }"
      />
    </div>
  </article>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700&family=DM+Mono:wght@300;400&display=swap');

.user-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.07);
  border-radius: 16px;
  padding: 14px 16px;
  transition:
    background 0.2s,
    transform 0.15s;
  cursor: default;
  position: relative;
  overflow: hidden;
}
.user-card:hover {
  background: rgba(255, 255, 255, 0.055);
  transform: translateY(-1px);
}

.dist-very-close {
  border-left: 2px solid #00ffc3;
}
.dist-close {
  border-left: 2px solid #5b8fff;
}
.dist-near {
  border-left: 2px solid #a78bfa;
}
.dist-far {
  border-left: 2px solid #334155;
}

.avatar {
  position: relative;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
}
.avatar-initials {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: hsl(var(--hue, 180), 40%, 20%);
  color: hsl(var(--hue, 180), 80%, 75%);
  font-family: 'Syne', sans-serif;
  font-weight: 700;
  font-size: 14px;
  z-index: 1;
}
.avatar-ring {
  position: absolute;
  inset: -3px;
  border-radius: 50%;
  border: 1.5px solid hsl(var(--hue, 180), 70%, 50%);
  opacity: 0.5;
  animation: ring-pulse 3s ease-in-out infinite;
}
@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.12);
    opacity: 0.15;
  }
}

.card-body {
  flex: 1;
  min-width: 0;
}
.username {
  font-family: 'Syne', sans-serif;
  font-weight: 600;
  font-size: 15px;
  margin: 0 0 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #dde4f0;
}
.distance {
  font-family: 'DM Mono', monospace;
  font-size: 12px;
  color: #4a6080;
  margin: 0;
}

.signal-strength {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 18px;
  flex-shrink: 0;
}
.bar {
  width: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.08);
  transition: background 0.3s;
}
.bar:nth-child(1) {
  height: 6px;
}
.bar:nth-child(2) {
  height: 9px;
}
.bar:nth-child(3) {
  height: 13px;
}
.bar:nth-child(4) {
  height: 18px;
}
.bar.lit {
  background: #00ffc3;
  box-shadow: 0 0 4px rgba(0, 255, 195, 0.5);
}
</style>
