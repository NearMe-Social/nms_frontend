<template>
  <div class="preview-card" :class="[item.severity, { hidden: item.status === 'hidden', removed: isRemoved }]">
    <div class="severity-stripe" :class="item.severity"></div>

    <div class="thumb" :class="item.mediaType">
      <div v-if="item.mediaType === 'image'" class="img-bg"></div>
      <div v-if="item.mediaType === 'video'" class="vid-bg">
        <div class="vid-play"><PlayIcon /></div>
      </div>
      <div v-if="item.mediaType === 'text'" class="txt-bg">
        <TextIcon />
      </div>
      <span class="media-label">{{ item.mediaType.toUpperCase() }}</span>
    </div>

    <div class="card-content">
      <div class="card-top">
        <div class="meta-row">
          <span class="report-chip" :class="item.severity">
            <FlagIcon /> {{ item.reports }} Reports
          </span>
          <span class="reason-chip" :class="item.reason">{{ reasonLabel[item.reason] }}</span>
          <span class="time">{{ item.timestamp }}</span>
          <span v-if="item.status === 'hidden'" class="hidden-chip"><EyeOffIcon /> Hidden</span>
        </div>

        <h3 class="card-title">{{ item.title }}</h3>
        <p class="card-author">
          <span class="at">@</span>{{ item.author }} ·
          <span class="type-label">{{ item.type }} · ID: {{ item.id }}</span>
        </p>
        <p class="card-preview">{{ item.preview }}</p>
      </div>

      <HideRemoveRestoreButtons
        :status="item.status"
        :itemId="item.id"
        @hide="emit('hide', $event)"
        @remove="onRemove"
        @restore="emit('restore', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import HideRemoveRestoreButtons from './HideRemoveRestoreButtons.vue'

const props = defineProps({ item: { type: Object, required: true } })
const emit = defineEmits(['hide', 'remove', 'restore'])

const PlayIcon = { template: `<svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>` }
const TextIcon = { template: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="17" x2="12" y2="17"/></svg>` }
const FlagIcon = { template: `<svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1zM4 22v-7"/></svg>` }
const EyeOffIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>` }

const isRemoved = ref(false)
function onRemove(id) { isRemoved.value = true; setTimeout(() => emit('remove', id), 350) }

const reasonLabel = { spam: 'Spam', harassment: 'Harassment', graphic: 'Graphic Content', misinformation: 'Misinformation' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');

*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
}

.preview-card {
  display: flex;
  align-items: stretch;
  background: #fff;
  border: 1px solid #e8e9ec;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,.05);
  transition: opacity .35s, transform .35s;
  font-family: 'DM Sans', sans-serif;
  position: relative;
}
.preview-card.hidden { 
    background: #fafbfc; 
}

.preview-card.removed { 
    opacity: 0; 
    transform: scale(.97) translateY(-4px); 
    pointer-events: none; 
}

/* Severity left stripe */
.severity-stripe { 
    width: 4px; 
    flex-shrink: 0; 
}

.severity-stripe.high { 
    background: linear-gradient(180deg, #ef4444, #f97316); 
}

.severity-stripe.medium { 
    background: #f59e0b; 
}

.severity-stripe.low { 
    background: #60a5fa; 
}

.thumb {
  width: 110px;
  flex-shrink: 0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.img-bg { 
    position: absolute; 
    inset: 0; background: 
    linear-gradient(135deg, #1a0a00 0%, #b34000 50%, #ff6b1a 100%); 
}

.vid-bg { 
    position: absolute; 
    inset: 0; 
    background: #111; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
}

.vid-play { 
    width: 36px; 
    height: 36px; 
    border-radius: 50%; 
    background: rgba(255,255,255,.2); 
    display: grid; 
    place-items: center; 
}

.txt-bg { 
    position: absolute; 
    inset: 0; 
    background: #f0f1f5; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
}

.media-label {
  position: absolute;
  bottom: 6px; left: 6px;
  font-size: 9px; font-weight: 700; letter-spacing: .06em;
  background: rgba(0,0,0,.5); color: #fff;
  border-radius: 4px; padding: 2px 5px;
  backdrop-filter: blur(3px);
}

.txt-bg ~ .media-label { 
    background: rgba(0,0,0,.12); 
    color: #6b7080; 
}


.card-content { 
    flex: 1; 
    padding: 14px 16px; 
    display: flex; 
    flex-direction: column; 
    gap: 10px; 
    min-width: 0; 
}

.card-top { 
    display: flex; 
    flex-direction: column; 
    gap: 5px; 
}

.meta-row { 
    display: flex; 
    align-items: center; 
    flex-wrap: wrap; 
    gap: 6px; 
}

.report-chip {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; font-weight: 700;
  border-radius: 20px; padding: 2px 8px;
}
.report-chip.high { 
    background: #fef2f2; 
    color: #b91c1c; 
}

.report-chip.medium { 
    background: #fff7ed; 
    color: #c2410c; 
}

.report-chip.low { 
    background: #eff6ff; 
    color: #1d4ed8; 
}

.reason-chip {
  font-size: 11px; font-weight: 600;
  border-radius: 5px; padding: 2px 8px;
  text-transform: capitalize;
}
.reason-chip.spam {
 background: #f5f3ff; 
 color: #6d28d9; 
}
.reason-chip.harassment { 
    background: #fef2f2; 
    color: #b91c1c; 
}

.reason-chip.graphic { 
    background: #fffbeb; 
    color: #92400e; 
}

.reason-chip.misinformation { 
    background: #ecfeff; 
    color: #0e7490; 
}

.time { 
    font-size: 11px; 
    color: #9aa0b0; 
    margin-left: auto; 
}

.hidden-chip { 
    display: inline-flex; 
    align-items: center; 
    gap: 4px; font-size: 11px; 
    font-weight: 600; 
    background: #f3f4f6; 
    color: #6b7280; 
    border-radius: 5px; 
    padding: 2px 7px; 
}

.card-title { 
    font-family: 'Syne', sans-serif; 
    font-size: 14px; 
    font-weight: 700; 
    color: #16181d; 
}

.card-author { 
    font-size: 11.5px; 
    color: #6b7080; 
}

.at { 
    color: #4f6ef7; 
}

.type-label { 
    color: #9aa0b0; 
}

.card-preview { 
    font-size: 12.5px; 
    color: #6b7080; 
    line-height: 1.55; 
    display: -webkit-box; 
    -webkit-line-clamp: 2; 
    -webkit-box-orient: vertical; 
    overflow: hidden; 
}
</style>