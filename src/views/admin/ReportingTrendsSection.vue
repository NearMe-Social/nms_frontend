<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
      <div>
        <h2 class="text-base font-bold text-gray-800">Reporting Trends</h2>
        <p class="text-xs text-gray-400 mt-0.5">Report submissions over time</p>
      </div>
      <!-- Period selector -->
      <div class="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          @click="selectedPeriod = option.value"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ease-out',
            selectedPeriod === option.value
              ? 'bg-white text-gray-800 shadow-sm border border-gray-200'
              : 'text-gray-400 hover:text-gray-600'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Stats row -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-gray-50 rounded-xl px-4 py-3 flex flex-col gap-1"
      >
        <span class="text-xs text-gray-400 font-medium">{{ stat.label }}</span>
        <span class="text-xl font-bold" :class="stat.color">{{ stat.value }}</span>
        <div class="flex items-center gap-1">
          <TrendingUp v-if="stat.trend > 0" class="w-3 h-3 text-green-500" />
          <TrendingDown v-else class="w-3 h-3 text-red-400" />
          <span class="text-xs" :class="stat.trend > 0 ? 'text-green-500' : 'text-red-400'">
            {{ Math.abs(stat.trend) }}% vs last period
          </span>
        </div>
      </div>
    </div>

    <!-- Chart area -->
    <div class="relative h-52">
      <!-- Y-axis labels -->
      <div class="absolute left-0 top-0 bottom-6 flex flex-col justify-between pr-2">
        <span v-for="label in yLabels" :key="label" class="text-xs text-gray-300 text-right w-6">{{ label }}</span>
      </div>

      <!-- Chart -->
      <div class="absolute left-8 right-0 top-0 bottom-6">
        <!-- Grid lines -->
        <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
          <div v-for="i in 5" :key="i" class="border-t border-gray-100 w-full"></div>
        </div>

        <!-- Bars -->
        <div class="absolute inset-0 flex items-end gap-1.5 px-1">
          <div
            v-for="(bar, index) in chartData"
            :key="index"
            class="flex-1 flex flex-col items-center gap-1 group"
          >
            <!-- Stacked bars -->
            <div class="w-full flex flex-col gap-0.5 items-center relative">
              <!-- Tooltip -->
              <div class="absolute -top-16 left-1/2 -translate-x-1/2 bg-gray-800 text-white rounded-lg px-2.5 py-1.5 text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 shadow-lg">
                <div class="font-semibold mb-0.5">{{ bar.label }}</div>
                <div class="flex flex-col gap-0.5">
                  <span class="text-purple-300">Post: {{ bar.post }}</span>
                  <span class="text-blue-300">User: {{ bar.user }}</span>
                  <span class="text-orange-300">Comment: {{ bar.comment }}</span>
                  <span class="text-teal-300">Message: {{ bar.message }}</span>
                </div>
                <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
              </div>

              <!-- Bar segments -->
              <div class="w-full flex flex-col-reverse rounded-t-md overflow-hidden" :style="{ height: barHeight(bar) + 'px' }">
                <div
                  class="w-full transition-all duration-700 ease-out bg-purple-400 hover:bg-purple-500"
                  :style="{ height: segmentHeight(bar.post, bar) + '%' }"
                ></div>
                <div
                  class="w-full transition-all duration-700 ease-out bg-blue-400 hover:bg-blue-500"
                  :style="{ height: segmentHeight(bar.user, bar) + '%' }"
                ></div>
                <div
                  class="w-full transition-all duration-700 ease-out bg-orange-400 hover:bg-orange-500"
                  :style="{ height: segmentHeight(bar.comment, bar) + '%' }"
                ></div>
                <div
                  class="w-full transition-all duration-700 ease-out bg-teal-400 hover:bg-teal-500"
                  :style="{ height: segmentHeight(bar.message, bar) + '%' }"
                ></div>
              </div>
            </div>
            <!-- X label -->
            <span class="text-xs text-gray-400 mt-1">{{ bar.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-3 sm:gap-4 mt-4 pt-4 border-t border-gray-100">
      <div v-for="item in legend" :key="item.label" class="flex items-center gap-1.5">
        <span class="w-2.5 h-2.5 rounded-sm" :class="item.color"></span>
        <span class="text-xs text-gray-500 font-medium">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { TrendingUp, TrendingDown } from 'lucide-vue-next'

const props = defineProps({
  reports: { type: Array, default: () => [] },
})

const selectedPeriod = ref('7d')

const periodOptions = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
]

const legend = [
  { label: 'Post', color: 'bg-purple-400' },
  { label: 'User', color: 'bg-blue-400' },
  { label: 'Comment', color: 'bg-orange-400' },
  { label: 'Message', color: 'bg-teal-400' },
]

const yLabels = computed(() => {
  const max = Math.max(...chartData.value.map(d => d.post + d.user + d.comment + d.message), 1)
  const step = Math.ceil(max / 4)
  return [max, step * 3, step * 2, step, 0].map(v => v)
})

// Build chart data from reports prop grouped by date
const chartData = computed(() => {
  const days = selectedPeriod.value === '7d' ? 7 : selectedPeriod.value === '30d' ? 30 : 90
  const labels = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const label = days <= 7
      ? d.toLocaleDateString('en-US', { weekday: 'short' })
      : days <= 30
        ? d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

    const dayReports = props.reports.filter(r => {
      const rd = new Date(r.created_at || r.createdAt)
      return rd.toISOString().slice(0, 10) === key
    })

    labels.push({
      label,
      post: dayReports.filter(r => (r.type || r.targetType || '').toLowerCase() === 'post').length,
      user: dayReports.filter(r => (r.type || r.targetType || '').toLowerCase() === 'user').length,
      comment: dayReports.filter(r => (r.type || r.targetType || '').toLowerCase() === 'comment').length,
      message: dayReports.filter(r => (r.type || r.targetType || '').toLowerCase() === 'message').length,
    })
  }

  // Show only every Nth label to avoid crowding
  const step = days <= 7 ? 1 : days <= 30 ? 3 : 10
  return labels.filter((_, i) => i % step === 0 || i === labels.length - 1)
})

const stats = computed(() => {
  const total = props.reports.length
  const pending = props.reports.filter(r => (r.status || '').toLowerCase() === 'pending').length
  const reviewed = props.reports.filter(r => (r.status || '').toLowerCase() === 'reviewed').length
  const postReports = props.reports.filter(r => (r.type || r.targetType || '').toLowerCase() === 'post').length

  return [
    { label: 'Total Reports', value: total, color: 'text-gray-800', trend: 12 },
    { label: 'Pending', value: pending, color: 'text-yellow-600', trend: 8 },
    { label: 'Reviewed', value: reviewed, color: 'text-blue-600', trend: -3 },
    { label: 'Post Reports', value: postReports, color: 'text-purple-600', trend: 5 },
  ]
})

const MAX_BAR_HEIGHT = 140

function barTotal(bar) {
  return bar.post + bar.user + bar.comment + bar.message
}

function barHeight(bar) {
  const maxTotal = Math.max(...chartData.value.map(b => barTotal(b)), 1)
  return Math.max((barTotal(bar) / maxTotal) * MAX_BAR_HEIGHT, barTotal(bar) > 0 ? 4 : 0)
}

function segmentHeight(value, bar) {
  const total = barTotal(bar)
  if (total === 0) return 0
  return (value / total) * 100
}
</script>
