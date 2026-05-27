<template>
  <div class="flagged-list-wrap">
    
    <div class="list-header">
      <div class="header-left">
        <h2 class="list-title">Flagged Content</h2>
        <span class="count-badge">{{ items.length }}</span>
      </div>
      <div class="header-controls">
        <select v-model="filterType" class="f-select">
          <option value="">All Types</option>
          <option value="post">Post</option>
          <option value="comment">Comment</option>
          <option value="video">Video</option>
        </select>
        <select v-model="filterReason" class="f-select">
          <option value="">All Reasons</option>
          <option value="spam">Spam</option>
          <option value="harassment">Harassment</option>
          <option value="graphic">Graphic Content</option>
          <option value="misinformation">Misinformation</option>
        </select>
        <button class="sort-toggle" @click="sortDesc = !sortDesc">
          <SortDescIcon v-if="sortDesc" /> <SortAscIcon v-else /> By Reports
        </button>
      </div>
    </div>

    <div class="list-body">
      <ContentPreviewCard
        v-for="item in sorted"
        :key="item.id"
        :item="item"
        @hide="handleHide"
        @remove="handleRemove"
        @restore="handleRestore"
      />

    
      <ModerationEmptyState v-if="sorted.length === 0" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ContentPreviewCard from './ContentPreviewCard.vue'
import ModerationEmptyState from './ModerationEmptyState.vue'

const SortDescIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="11" y2="18"/><path d="M3 6l3-3v18"/></svg>` }
const SortAscIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="18" x2="11" y2="18"/><path d="M3 18l3 3V3"/></svg>` }

const filterType = ref('')
const filterReason = ref('')
const sortDesc = ref(true)

const items = ref([
  {
    id: 'F-001', type: 'post', reason: 'harassment', reports: 12, status: 'pending',
    title: 'Nightlife in Neo-Seoul', author: 'alex_kim92', authorId: 'U-001',
    preview: 'User reported for repeated harassment in comments section targeting specific group members.',
    mediaType: 'image', timestamp: '2h ago', severity: 'medium',
  },
  {
    id: 'F-002', type: 'comment', reason: 'spam', reports: 8, status: 'pending',
    title: 'Comment on "New Tech Launch"', author: 'crypto_bot_01', authorId: 'U-003',
    preview: 'Amazing project! I made $5000 in two weeks using this simple trick. Click link in bio to learn how...',
    mediaType: 'text', timestamp: '3h ago', severity: 'low',
  },
  {
    id: 'F-003', type: 'video', reason: 'graphic', reports: 56, status: 'pending',
    title: 'Unboxing the Unknown', author: 'urban_explorer', authorId: 'U-004',
    preview: 'Automated system flagged video for potentially graphic imagery at timestamp 08:24. Multiple users reported for dangerous activities.',
    mediaType: 'video', timestamp: '10m ago', severity: 'high',
  },
  {
    id: 'F-004', type: 'post', reason: 'misinformation', reports: 21, status: 'hidden',
    title: 'Vaccine Truth Exposed', author: 'truth_speaker', authorId: 'U-007',
    preview: 'Post containing medically unverified claims about vaccine safety with links to known misinformation sites.',
    mediaType: 'text', timestamp: '1d ago', severity: 'high',
  },
])

const sorted = computed(() => {
  let list = items.value
  if (filterType.value) list = list.filter(i => i.type === filterType.value)
  if (filterReason.value) list = list.filter(i => i.reason === filterReason.value)
  return [...list].sort((a, b) => sortDesc.value ? b.reports - a.reports : a.reports - b.reports)
})

function handleHide(id) { const item = items.value.find(i => i.id === id); if (item) item.status = 'hidden' }
function handleRemove(id) { items.value = items.value.filter(i => i.id !== id) }
function handleRestore(id) { const item = items.value.find(i => i.id === id); if (item) item.status = 'pending' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');
*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
}

.flagged-list-wrap { 
    display: flex; 
    flex-direction: column; 
    gap: 0; 
    font-family: 'DM Sans', sans-serif; 
}

.list-header { 
    display: flex; 
    align-items: center; 
    justify-content: space-between; 
    flex-wrap: wrap; gap: 10px;
    padding: 0 0 16px; 
}

.header-left { 
    display: flex; 
    align-items: center; 
    gap: 10px; 
}

.list-title { 
    font-family: 'Syne', sans-serif; 
    font-size: 18px; 
    font-weight: 700; 
    color: #16181d; 
}

.count-badge { 
    background: #fef2f2; 
    color: #b91c1c; 
    font-size: 12px; 
    font-weight: 700; 
    border-radius: 20px; 
    padding: 2px 9px; 
}

.header-controls { 
    display: flex; 
    align-items: center; 
    gap: 7px; 
    flex-wrap: wrap; 
}

.f-select { 
    border: 1px solid #e8e9ec; 
    border-radius: 8px; 
    padding: 6px 10px; 
    font-family: 'DM Sans', sans-serif; 
    font-size: 13px; 
    background: #fff; 
    color: #374151; 
    outline: none; 
    cursor: pointer; 
}

.sort-toggle { 
    display: flex; 
    align-items: center; 
    gap: 5px; 
    padding: 6px 12px; 
    border: 1px solid #e8e9ec; 
    border-radius: 8px; 
    background: #fff; 
    font-family: 'DM Sans', sans-serif; 
    font-size: 13px; color: #6b7080; 
    cursor: pointer; 
    transition: background .15s; 
}

.sort-toggle:hover { 
    background: #f4f5f7; 
}

.list-body { 
    display: flex; 
    flex-direction: column; 
    gap: 12px; 
}

</style>