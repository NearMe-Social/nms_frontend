<template>
  <div class="page">
    <div class="page-header">
      <div>
        <div class="breadcrumb"><span>Admin</span><ChevronIcon /><span class="bc-active">Moderation</span></div>
        <h1 class="page-title">Moderation</h1>
        <p class="page-sub">Review and resolve flagged content across the platform.</p>
      </div>
      <div class="header-actions">
        <button class="hdr-btn outline" @click="refresh"><RefreshIcon /> Refresh</button>
        <button class="hdr-btn primary"><DownloadIcon /> Export Report</button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card" v-for="stat in stats" :key="stat.label" :class="{ highlight: stat.highlight }">
        <div class="stat-icon" :style="{ background: stat.iconBg, color: stat.iconColor }">
          <component :is="stat.icon" />
        </div>
        <div class="stat-body">
          <div class="stat-val">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
        <div class="stat-trend" :class="stat.trend">{{ stat.delta }}</div>
      </div>
    </div>

    <div class="main-layout">
      
      <div class="list-col">
       
        <div class="tabs">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="tab"
            :class="{ active: activeTab === tab.key }"
            @click="activeTab = tab.key"
          >
            <component :is="tab.icon" class="tab-icon" :class="tab.iconClass" />
            {{ tab.label }}
            <span v-if="tab.count" class="tab-count" :class="tab.countClass">{{ tab.count }}</span>
          </button>
        </div>

        <FlaggedContentList />
      </div>

      <!-- Right: Activity panel -->
      <div class="sidebar-col">
        <!-- Quick Stats -->
        <div class="panel">
          <h3 class="panel-title">Today's Activity</h3>
          <div class="activity-list">
            <div class="activity-item" v-for="act in activity" :key="act.label">
              <div class="act-dot" :class="act.color"></div>
              <span class="act-label">{{ act.label }}</span>
              <span class="act-val">{{ act.value }}</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">Top Reporters</h3>
          <div class="reporter-list">
            <div class="reporter-item" v-for="r in reporters" :key="r.name">
              <div class="rep-avatar" :style="{ background: r.color }">{{ r.initials }}</div>
              <span class="rep-name">{{ r.name }}</span>
              <span class="rep-count">{{ r.count }} reports</span>
            </div>
          </div>
        </div>

        <div class="panel">
          <h3 class="panel-title">Reports by Reason</h3>
          <div class="breakdown-list">
            <div class="breakdown-item" v-for="b in breakdown" :key="b.label">
              <div class="bk-header">
                <span class="bk-label">{{ b.label }}</span>
                <span class="bk-val">{{ b.pct }}%</span>
              </div>
              <div class="bk-bar-bg">
                <div class="bk-bar" :style="{ width: b.pct + '%', background: b.color }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  ChevronRight,
  RefreshCw,
  Download,
  AlertTriangle,
  Clock3,
  Check,
  Flag,
  Shield,
  Trash2
} from 'lucide-vue-next'
import FlaggedContentList from './FlaggedContentList.vue';
import ContentPreviewCard from './ContentPreviewCard.vue';
import HideRemoveRestoreButtons from './HideRemoveRestoreButtons.vue';
import ModerationEmptyState from './ModerationEmptyState.vue';


const ChevronIcon = ChevronRight
const RefreshIcon = RefreshCw
const DownloadIcon = Download
const AlertIcon = AlertTriangle
const ClockIcon = Clock3
const CheckIcon = Check
const FlagIcon = Flag
const ShieldIcon = Shield
const TrashIcon = Trash2

const activeTab = ref('high')
const tabs = [
  { key: 'high',     label: 'High Risk',       icon: AlertIcon, iconClass: 'icon-red',    count: 3,  countClass: 'red' },
  { key: 'pending',  label: 'Pending Review',  icon: ClockIcon, iconClass: 'icon-yellow', count: 18, countClass: 'yellow' },
  { key: 'resolved', label: 'Resolved Today',  icon: CheckIcon, iconClass: 'icon-green',  count: null },
]

const stats = [
  { label: 'Pending Review', value: '97',  delta: '+14 today', trend: 'up',   highlight: true, icon: FlagIcon,   iconBg: '#fef2f2', iconColor: '#b91c1c' },
  { label: 'Resolved Today', value: '43',  delta: '+8 vs yesterday', trend: 'up', icon: CheckIcon,  iconBg: '#f0fdf4', iconColor: '#16a34a' },
  { label: 'Auto-Hidden',    value: '22',  delta: 'by AI system',   trend: '',   icon: ShieldIcon, iconBg: '#eff6ff', iconColor: '#3b82f6' },
  { label: 'Content Removed',value: '11',  delta: '3 permanent',    trend: '',   icon: TrashIcon,  iconBg: '#fff7ed', iconColor: '#c2410c' },
]

const activity = [
  { label: 'Reports received', value: '34', color: 'red' },
  { label: 'Items reviewed',   value: '28', color: 'blue' },
  { label: 'Items resolved',   value: '21', color: 'green' },
  { label: 'Users warned',     value: '5',  color: 'yellow' },
  { label: 'Accounts suspended', value: '2', color: 'orange' },
]

const reporters = [
  { name: 'community_watch', initials: 'CW', count: 14, color: '#4f6ef7' },
  { name: 'safety_patrol',   initials: 'SP', count: 9,  color: '#16a34a' },
  { name: 'mod_helper_x',    initials: 'MH', count: 7,  color: '#d97706' },
]

const breakdown = [
  { label: 'Spam',           pct: 38, color: '#7c3aed' },
  { label: 'Harassment',     pct: 29, color: '#dc2626' },
  { label: 'Graphic Content',pct: 20, color: '#d97706' },
  { label: 'Misinformation', pct: 13, color: '#0891b2' },
]

function refresh() { window.location.reload() }
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700&display=swap');
*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
}

.page { 
    display: flex; 
    flex-direction: column; 
    gap: 24px; 
    padding: 28px; 
    background: #f4f5f7; 
    min-height: 100vh; 
    font-family: 'DM Sans', sans-serif; 
}


.page-header { 
    display: flex; 
    align-items: flex-start; 
    justify-content: space-between; 
    gap: 16px; 
    flex-wrap: wrap; }

.breadcrumb { 
    display: flex; 
    align-items: center; 
    gap: 5px; 
    font-size: 12px; 
    color: #9aa0b0; 
    margin-bottom: 6px; }

.bc-active { 
    color: #4f6ef7; 
    font-weight: 500; 
}

.page-title { 
    font-family: 'Syne', sans-serif; 
    font-size: 24px; 
    font-weight: 700; 
    color: #16181d; 
}

.page-sub { 
    font-size: 13px; 
    color: #6b7080; 
    margin-top: 4px; 
}

.header-actions { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
}

.hdr-btn { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    padding: 8px 16px; 
    border-radius: 8px; 
    font-family: 'DM Sans', sans-serif; 
    font-size: 13px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all .15s; 
}

.hdr-btn.outline { 
    background: #fff; 
    border: 1px solid #e8e9ec; 
    color: #374151; 
}

.hdr-btn.outline:hover { 
    background: #f4f5f7; 
}

.hdr-btn.primary { 
    background: #4f6ef7; 
    border: 1px solid #4f6ef7; 
    color: #fff; 
}

.hdr-btn.primary:hover { 
    background: #3b5bdb; 
}


.stats-row { 
    display: grid; 
    grid-template-columns: repeat(4, 1fr); 
    gap: 14px; 
}

.stat-card { 
    background: #fff; 
    border: 1px solid #e8e9ec; 
    border-radius: 12px; 
    padding: 16px 18px; 
    display: flex; 
    align-items: center; 
    gap: 12px; 
    box-shadow: 0 1px 3px rgba(0,0,0,.04); 
}

.stat-card.highlight { 
    border-color: #fecaca; 
    background: #fff5f5; 
}

.stat-icon { 
    width: 42px; 
    height: 42px; 
    border-radius: 10px; 
    display: grid; 
    place-items: center; 
    flex-shrink: 0; 
}

.stat-body { 
    flex: 1; 
}

.stat-val { 
    font-family: 'Syne', sans-serif; 
    font-size: 22px; 
    font-weight: 700; 
    color: #16181d; 
}

.stat-label { 
    font-size: 12px; 
    color: #6b7080; 
    margin-top: 2px; 
}

.stat-trend { 
    font-size: 11px; 
    font-weight: 600; 
    white-space: nowrap; 
}

.stat-trend.up { 
    color: #dc2626; 
}


.main-layout { 
    display: grid; 
    grid-template-columns: 1fr 280px; 
    gap: 20px; 
    align-items: start; 
}

.tabs { 
    display: flex; 
    gap: 6px; 
    margin-bottom: 14px; 
}

.tab { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    padding: 7px 14px; 
    border-radius: 8px; 
    border: 1px solid transparent; 
    background: transparent; 
    font-family: 'DM Sans', sans-serif; 
    font-size: 13px; 
    font-weight: 500; 
    color: #6b7080; 
    cursor: pointer; 
    transition: all .15s; 
}

.tab:hover { 
    background: #fff; 
    border-color: #e8e9ec; 
}

.tab.active { 
    background: #fff; 
    border-color: #e8e9ec; 
    color: #16181d; 
    box-shadow: 0 1px 4px rgba(0,0,0,.06); 
}

.tab-icon { 
    flex-shrink: 0; 
}

.icon-red { 
    color: #dc2626; 
}

.icon-yellow { 
    color: #d97706; 
}

.icon-green { 
    color: #16a34a; 
}

.tab-count { 
    font-size: 11px; 
    font-weight: 700; 
    border-radius: 10px; 
    padding: 1px 7px; 
}

.tab-count.red { 
    background: #fef2f2; 
    color: #b91c1c; 
}

.tab-count.yellow { 
    background: #fffbeb; 
    color: #92400e; 
}

/* Sidebar panels */
.sidebar-col { 
    display: flex; 
    flex-direction: column; 
    gap: 14px; 
}

.panel { 
    background: #fff; 
    border: 1px solid #e8e9ec; 
    border-radius: 12px; 
    padding: 16px 18px; 
}

.panel-title { 
    font-size: 12px; 
    font-weight: 700; 
    color: #9aa0b0; 
    text-transform: uppercase; 
    letter-spacing: .05em; 
    margin-bottom: 12px; 
}

/* Activity */
.activity-list { 
    display: flex; 
    flex-direction: column; 
    gap: 9px; 
}

.activity-item { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    font-size: 13px; 
}

.act-dot { 
    width: 8px; 
    height: 8px; 
    border-radius: 50%; 
    flex-shrink: 0; 
}

.act-dot.red    { 
    background: #dc2626; 
}

.act-dot.blue   { 
    background: #3b82f6; 
}

.act-dot.green  { 
    background: #16a34a; 
}

.act-dot.yellow {
    background: #d97706; 
}

.act-dot.orange { 
    background: #ea580c; 
}

.act-label { 
    flex: 1; 
    color: #6b7080; 
}

.act-val { 
    font-weight: 700; 
    color: #16181d; 
}


.reporter-list { 
    display: flex; 
    flex-direction: column; 
    gap: 9px; 
}

.reporter-item { 
    display: flex; 
    align-items: center; 
    gap: 9px; 
}

.rep-avatar { 
    width: 28px; 
    height: 28px; 
    border-radius: 50%; 
    color: #fff; 
    font-size: 10px; 
    font-weight: 700; 
    display: grid; 
    place-items: center; 
    flex-shrink: 0; 
}

.rep-name { 
    flex: 1; 
    font-size: 12.5px; 
    color: #374151; 
    font-weight: 500; 
}

.rep-count { 
    font-size: 11.5px; 
    color: #9aa0b0; 
}


.breakdown-list {
    display: flex; 
    flex-direction: column; 
    gap: 11px; 
}

.bk-header { 
    display: flex; 
    justify-content: space-between; 
    margin-bottom: 5px; 
}

.bk-label { 
    font-size: 12.5px; 
    color: #374151; 
}

.bk-val { 
    font-size: 12px; 
    font-weight: 700; 
    color: #16181d; 
}

.bk-bar-bg { 
    height: 6px; 
    background: #f3f4f6; 
    border-radius: 99px; 
    overflow: hidden; 
}

.bk-bar { 
    height: 100%; 
    border-radius: 99px; 
    transition: width .6s ease; 
}

@media (max-width: 1024px) { .main-layout { grid-template-columns: 1fr; } .stats-row { grid-template-columns: 1fr 1fr; } }
@media (max-width: 600px) { .stats-row { grid-template-columns: 1fr; } .page { padding: 16px; } }
</style>