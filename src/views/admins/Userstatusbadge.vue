<template>
  <span class="status-badge" :class="[status, { dot: showDot }]">
    <span v-if="showDot" class="pulse-dot" :class="status"></span>
    <component :is="iconMap[status]" class="badge-icon" v-if="showIcon" />
    {{ labelMap[status] || status }}
  </span>
</template>

<script setup>
const props = defineProps({
  status: { type: String, required: true }, 
  showDot: { type: Boolean, default: true },
  showIcon: { type: Boolean, default: false },
})

const CheckIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` }
const BanIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>` }
const ClockIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>` }
const PauseIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>` }
const MinusIcon = { template: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>` }

const iconMap = { active: CheckIcon, banned: BanIcon, pending: ClockIcon, suspended: PauseIcon, inactive: MinusIcon }
const labelMap = { active: 'Active', suspended: 'Suspended', pending: 'Pending', banned: 'Banned', inactive: 'Inactive' }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;600&display=swap');

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11.5px;
  font-weight: 600;
  border-radius: 20px;
  padding: 3px 9px 3px 7px;
  white-space: nowrap;
  letter-spacing: .01em;
}

/* Active */
.status-badge.active { 
    background: #dcfce7; 
    color: #15803d; 
}
/* Suspended */
.status-badge.suspended { 
    background: #fff7ed; 
    color: #c2410c; 
}
/* Pending */
.status-badge.pending { 
    background: #fefce8; 
    color: #a16207; 
}
/* Banned */
.status-badge.banned { 
    background: #fef2f2; 
    color: #b91c1c; 
}
/* Inactive */
.status-badge.inactive { 
    background: #f3f4f6; 
    color: #6b7280; 
}

.badge-icon { 
    flex-shrink: 0; 
}

/* Pulse dot */
.pulse-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
  position: relative;
}

.pulse-dot.active {
  background: #16a34a;
  box-shadow: 0 0 0 0 rgba(22,163,74,.4);
  animation: pulse-green 2s infinite;
}
.pulse-dot.suspended { 
    background: #ea580c; 
}

.pulse-dot.pending {
  background: #ca8a04;
  box-shadow: 0 0 0 0 rgba(202,138,4,.4);
  animation: pulse-yellow 2.5s infinite;
}
.pulse-dot.banned { 
    background: #dc2626; 
}

.pulse-dot.inactive { 
    background: #9ca3af; 
}

@keyframes pulse-green {
  0%   { 
    box-shadow: 0 0 0 0 rgba(22,163,74,.45); 
}

  70%  { 
    box-shadow: 0 0 0 6px rgba(22,163,74,0); 
}

  100% { 
    box-shadow: 0 0 0 0 rgba(22,163,74,0); 
}

}

@keyframes pulse-yellow {
  0%   { 
    box-shadow: 0 0 0 0 rgba(202,138,4,.45); 
}

  70%  { 
    box-shadow: 0 0 0 6px rgba(202,138,4,0); 
}

  100% { 
    box-shadow: 0 0 0 0 rgba(202,138,4,0); 
}

}
</style>