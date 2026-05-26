<template>
  <span class="status-badge" :class="[status, { dot: showDot }]">
    <span v-if="showDot" class="pulse-dot" :class="status"></span>
    <component :is="iconMap[status]" class="badge-icon" v-if="showIcon" />
    {{ labelMap[status] || status }}
  </span>
</template>

<script setup>
import {
  Check,
  Ban,
  Clock3,
  Pause,
  Minus
} from 'lucide-vue-next'

const props = defineProps({
  status: { type: String, required: true }, 
  showDot: { type: Boolean, default: true },
  showIcon: { type: Boolean, default: false },
})

const CheckIcon = Check
const BanIcon = Ban
const ClockIcon = Clock3
const PauseIcon = Pause
const MinusIcon = Minus

const iconMap = { active: CheckIcon, banned: BanIcon, pending: ClockIcon, suspended: PauseIcon, inactive: MinusIcon }
const labelMap = { active: 'Active', suspended: 'Suspended', pending: 'Pending', banned: 'Banned', inactive: 'Inactive' }
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 13px;
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
