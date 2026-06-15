<script setup lang="ts">
import nearmeLogo from '@/assets/icons/main_logo.svg'

withDefaults(
  defineProps<{
    subtitle?: string
  }>(),
  {
    subtitle: 'Social',
  },
)
</script>

<template>
  <span class="brand-lockup" aria-label="Nearme Social">
    <span class="brand-symbol" aria-hidden="true">
      <img :src="nearmeLogo" alt="" />
    </span>
    <span class="brand-copy">
      <strong>Nearme</strong>
      <small>{{ subtitle }}</small>
    </span>
  </span>
</template>

<style scoped>
.brand-lockup {
  --brand-symbol-size: 34px;
  --brand-main-size: 1.2rem;
  --brand-sub-size: 0.72rem;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  line-height: 1;
}

.brand-symbol {
  width: var(--brand-symbol-size);
  height: var(--brand-symbol-size);
  position: relative;
  flex: 0 0 var(--brand-symbol-size);
  overflow: hidden;
  border-radius: 10px;
  background: #fff;
}

.brand-symbol img {
  width: 166%;
  height: 166%;
  position: absolute;
  top: 50%;
  left: 50%;
  display: block;
  object-fit: cover;
  transform: translate(-50%, -50%);
}

.brand-copy {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  white-space: nowrap;
}

.brand-copy strong {
  color: #0f5f71;
  font-size: var(--brand-main-size);
  font-weight: 900;
  letter-spacing: -0.02em;
}

.brand-copy small {
  color: #8b9aaa;
  font-size: var(--brand-sub-size);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
</style>
