<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>

<style>
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body,
#app {
  min-height: 100vh;
  background: #060810;
  color: #e8eaf6;
  font-family: 'Syne', sans-serif;
  -webkit-font-smoothing: antialiased;
}
</style>
