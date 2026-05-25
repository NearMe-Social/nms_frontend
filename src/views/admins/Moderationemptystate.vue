<template>
  <div class="empty-wrap" :class="variant">
    <div class="empty-illustration">
      <svg v-if="variant === 'moderation'" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="illo">
        
        <circle cx="60" cy="60" r="56" fill="#f0fdf4" />
        <path d="M60 22l28 10v22c0 16-12 30-28 34C44 84 32 70 32 54V32L60 22z" fill="#bbf7d0" stroke="#16a34a" stroke-width="2.5" stroke-linejoin="round"/>
       
        <path d="M46 61l10 10 18-20" stroke="#16a34a" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
       
        <circle cx="22" cy="30" r="3" fill="#bbf7d0"/>
        <circle cx="98" cy="40" r="2" fill="#bbf7d0"/>
        <circle cx="18" cy="80" r="2" fill="#dcfce7"/>
        <circle cx="102" cy="82" r="3" fill="#dcfce7"/>
      </svg>

      <svg v-else-if="variant === 'users'" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="illo">
        <circle cx="60" cy="60" r="56" fill="#eff6ff" />
        <circle cx="60" cy="48" r="16" fill="#bfdbfe" stroke="#3b82f6" stroke-width="2"/>
        <path d="M28 92c0-17.67 14.33-32 32-32s32 14.33 32 32" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" fill="#bfdbfe"/>
        <circle cx="22" cy="35" r="2.5" fill="#bfdbfe"/>
        <circle cx="98" cy="45" r="2" fill="#bfdbfe"/>
      </svg>

      <svg v-else viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="illo">
        <circle cx="60" cy="60" r="56" fill="#f9fafb" />
        <rect x="32" y="36" width="56" height="48" rx="6" fill="#e5e7eb" stroke="#d1d5db" stroke-width="2"/>
        <line x1="42" y1="52" x2="78" y2="52" stroke="#9ca3af" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="42" y1="62" x2="68" y2="62" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="42" y1="72" x2="60" y2="72" stroke="#d1d5db" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </div>

    <div class="empty-text">
      <h3 class="empty-title">{{ copy[variant].title }}</h3>
      <p class="empty-desc">{{ copy[variant].desc }}</p>
    </div>

    <button v-if="showAction" class="empty-action" @click="emit('action')">
      {{ copy[variant].action }}
    </button>
  </div>
</template>

<script setup>
const props = defineProps({
  variant: { type: String, default: 'moderation' }, 
  showAction: { type: Boolean, default: false },
})
const emit = defineEmits(['action'])

const copy = {
  moderation: {
    title: 'All clear — no flagged content',
    desc: 'There are no reports or flagged items to review right now. Great job keeping the community safe!',
    action: 'Refresh Queue',
  },
  users: {
    title: 'No users found',
    desc: 'No users match your current filters. Try adjusting your search or filter criteria.',
    action: 'Clear Filters',
  },
  search: {
    title: 'No results',
    desc: 'Your search didn\'t return any matches. Try different keywords or broaden your query.',
    action: 'Clear Search',
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');
*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
}

.empty-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 56px 24px;
  gap: 16px;
  font-family: 'DM Sans', sans-serif;
  background: #fff;
  border: 1px dashed #e8e9ec;
  border-radius: 14px;
}

.illo { width: 110px; height: 110px; }

.empty-illustration {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { 
    transform: translateY(0); 
}
  50% { 
    transform: translateY(-8px); 
}

}

.empty-text { 
    max-width: 340px; 
    display: flex; 
    flex-direction: column; 
    gap: 8px; 
}

.empty-title { 
    font-family: 'Syne', sans-serif; 
    font-size: 17px; 
    font-weight: 700; 
    color: #16181d; 
}

.empty-desc  { 
    font-size: 13.5px; 
    color: #6b7080; 
    line-height: 1.6; 
}

.empty-action {
  margin-top: 4px;
  padding: 9px 22px;
  border-radius: 8px;
  border: 1px solid #e8e9ec;
  background: #fff;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  cursor: pointer;
  transition: all .15s;
}

.empty-action:hover { 
    background: #f3f4f6; 
    border-color: #d1d5db; 
}

</style>