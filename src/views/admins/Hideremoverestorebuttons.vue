<template>
  <div class="action-bar">
    <Teleport to="body">
      <div v-if="confirming" class="overlay" @click.self="confirming = null">
        <div class="dialog">
          <div class="dialog-icon" :class="confirming">
            <component :is="confirmIconMap[confirming]" />
          </div>
          <h4 class="dialog-title">{{ confirmCopy[confirming].title }}</h4>
          <p class="dialog-desc">{{ confirmCopy[confirming].desc }}</p>
          <div class="dialog-actions">
            <button class="d-btn cancel" @click="confirming = null">Cancel</button>
            <button class="d-btn" :class="confirming" @click="doConfirm">
              {{ confirmCopy[confirming].ok }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <template v-if="variant === 'row'">
      <button class="act-btn hide" @click="ask('hide')" :disabled="status === 'removed'">
        <EyeOffIcon /> Hide
      </button>
      <button class="act-btn remove" @click="ask('remove')" :disabled="status === 'removed'">
        <TrashIcon /> Remove
      </button>
      <button class="act-btn restore" @click="ask('restore')" :disabled="status !== 'hidden'">
        <RotateIcon /> Restore
      </button>
    </template>

    <template v-if="variant === 'full'">
      <button class="full-btn hide" @click="ask('hide')" :disabled="status === 'removed'">
        <EyeOffIcon /> Hide Content
      </button>
      <button class="full-btn remove" @click="ask('remove')" :disabled="status === 'removed'">
        <TrashIcon /> Remove Permanently
      </button>
      <button class="full-btn restore" @click="ask('restore')" :disabled="status !== 'hidden'">
        <RotateIcon /> Restore
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  itemId: { type: String, required: true },
  status: { type: String, default: 'pending' }, 
  variant: { type: String, default: 'row' },    
})
const emit = defineEmits(['hide', 'remove', 'restore'])

const EyeOffIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>` }
const TrashIcon  = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>` }
const RotateIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>` }

const confirmIconMap = { hide: EyeOffIcon, remove: TrashIcon, restore: RotateIcon }
const confirmCopy = {
  hide:    { title: 'Hide this content?',       desc: 'Content will be hidden from public view but not permanently deleted.', ok: 'Yes, Hide' },
  remove:  { title: 'Remove permanently?',      desc: 'This action cannot be undone. The content will be deleted forever.',   ok: 'Yes, Remove' },
  restore: { title: 'Restore this content?',    desc: 'Content will become visible to users again.',                          ok: 'Yes, Restore' },
}

const confirming = ref(null)
function ask(action) { confirming.value = action }
function doConfirm() {
  emit(confirming.value, props.itemId)
  confirming.value = null
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

.action-bar { 
    display: flex; align-items: center; gap: 6px; flex-wrap: wrap; font-family: 'DM Sans', sans-serif; 
}


.act-btn {
  display: inline-flex; 
  align-items: center; 
  gap: 5px;
  padding: 5px 11px; 
  border-radius: 7px; 
  border: 1px solid;
  font-family: 'DM Sans', sans-serif; 
  font-size: 12px; 
  font-weight: 500;
  cursor: pointer; 
  transition: all .15s; 
  white-space: nowrap;
}

.act-btn:disabled { 
    opacity: .35; 
    cursor: not-allowed; 
}

.act-btn.hide    { 
    background: #f9fafb; 
    color: #374151; 
    border-color: #e5e7eb; 
}

.act-btn.hide:not(:disabled):hover { 
    background: #f3f4f6; 
}

.act-btn.remove  { 
    background: #fef2f2; 
    color: #b91c1c; 
    border-color: #fecaca; 
}

.act-btn.remove:not(:disabled):hover{ 
    background: #fee2e2; 
}

.act-btn.restore { 
    background: #f0fdf4; 
    color: #15803d; 
    border-color: #bbf7d0; 
}

.act-btn.restore:not(:disabled):hover { 
    background: #dcfce7; 
}


.full-btn {
  display: inline-flex; 
  align-items: center; 
  gap: 6px;
  padding: 8px 16px; 
  border-radius: 8px; 
  border: 1px solid;
  font-family: 'DM Sans', sans-serif; 
  font-size: 13px; 
  font-weight: 600;
  cursor: pointer; 
  transition: all .15s; 
  white-space: nowrap;
}

.full-btn:disabled { opacity: .35; 
    cursor: not-allowed; 
}

.full-btn.hide    { 
    background: #f9fafb; 
    color: #374151; 
    border-color: #e5e7eb; 
}

.full-btn.hide:not(:disabled):hover{ 
    background: #f3f4f6; 
}

.full-btn.remove  { 
    background: #dc2626; 
    color: #fff; 
    border-color: #dc2626; 
}

.full-btn.remove:not(:disabled):hover { 
    background: #b91c1c; 
    border-color: #b91c1c; 
}

.full-btn.restore { 
    background: #f0fdf4; 
    color: #15803d; 
    border-color: #bbf7d0; 
}

.full-btn.restore:not(:disabled):hover { 
    background: #dcfce7; 
}


.overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(16,18,28,.45); 
    backdrop-filter: blur(4px); 
    display: grid; place-items: center; 
    z-index: 1000; }

.dialog { 
    background: #fff; 
    border-radius: 14px; 
    padding: 28px; 
    width: 320px; 
    box-shadow: 0 24px 48px rgba(0,0,0,.15); 
    text-align: center; 
}

.dialog-icon { 
    width: 48px; 
    height: 48px; 
    border-radius: 50%; 
    display: grid; 
    place-items: center; 
    margin: 0 auto 14px; 
}

.dialog-icon.hide{ 
    background: #f3f4f6; 
    color: #374151; 
}

.dialog-icon.remove  { 
    background: #fef2f2; 
    color: #b91c1c; 
}

.dialog-icon.restore { 
    background: #f0fdf4; 
    color: #15803d; 
}

.dialog-title { 
    font-size: 16px; 
    font-weight: 700; 
    color: #16181d; 
    margin-bottom: 8px; 
}

.dialog-desc  { 
    font-size: 13px; 
    color: #6b7080; 
    line-height: 1.5; 
    margin-bottom: 20px; 
}

.dialog-actions { 
    display: flex; 
    gap: 8px; 
}

.d-btn { 
    flex: 1; 
    padding: 9px; 
    border-radius: 8px; 
    border: 1px solid; 
    font-family: 'DM Sans', sans-serif; 
    font-size: 13px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all .15s; 
}

.d-btn.cancel  { 
    background: #f9fafb; 
    color: #374151; 
    border-color: #e5e7eb; 
}

.d-btn.cancel:hover { 
    background: #f3f4f6; 
}

.d-btn.hide{ 
    background: #374151; 
    color: #fff; 
    border-color: #374151; 
}

.d-btn.hide:hover{ 
    background: #1f2937; 
}

.d-btn.remove  { 
    background: #dc2626; 
    color: #fff; 
    border-color: #dc2626; 
}

.d-btn.remove:hover  { 
    background: #b91c1c; 
}

.d-btn.restore { 
    background: #16a34a; 
    color: #fff; 
    border-color: #16a34a; 
}

.d-btn.restore:hover { 
    background: #15803d; 
}

</style>