<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="w-full px-6 py-6">
      <!-- Page header -->
      <div class="mb-8 animate-fade-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p class="text-gray-400 text-sm mt-1">Manage your community and monitor staff activity</p>
        </div>
      </div>

      <!-- Main grid layout: left content + right sidebar -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Main content area (left) -->
        <div class="lg:col-span-2 space-y-6 animate-fade-up">
          <!-- Dashboard stats -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DashboardStatCard
              title="Pending Reports"
              :value="pendingReports"
              icon="flag"
              color="red"
            />
            <DashboardStatCard
              title="Active Staff"
              :value="activeStaffCount"
              icon="users"
              color="blue"
            />
            <DashboardStatCard
              title="Total Users"
              :value="totalUsers"
              icon="user-check"
              color="green"
            />
            <DashboardStatCard
              title="Reports This Week"
              :value="weeklyReports"
              icon="trending-up"
              color="orange"
            />
          </div>

          <!-- Recent activity section -->
          <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 class="text-lg font-bold text-gray-800 mb-4">Recent Activity</h2>
            <div class="space-y-3">
              <div
                v-for="activity in recentActivities"
                :key="activity.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
              >
                <div class="flex items-center gap-3">
                  <div class="w-2 h-2 rounded-full" :class="getActivityColor(activity.type)"></div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ activity.title }}</p>
                    <p class="text-xs text-gray-500">{{ activity.timestamp }}</p>
                  </div>
                </div>
                <span class="text-xs font-medium text-gray-600">{{ activity.type }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right sidebar -->
        <div class="lg:col-span-1 space-y-6 animate-fade-up-delay">
          <!-- Quick Moderation Form -->
          <QuickModerationForm @action="handleModerationAction" />

          <!-- Active Staff Panel -->
          <ActiveStaffPanel :staff="activeStaff" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import Navbar from '@/components/Navbar.vue'
import DashboardStatCard from '@/views/admin/DashboardStatCard.vue'
import QuickModerationForm from '@/views/admin/QuickModerationForm.vue'
import ActiveStaffPanel from '@/views/admin/ActiveStaffPanel.vue'

// Mock data - replace with API calls
const pendingReports = ref(12)
const activeStaffCount = ref(5)
const totalUsers = ref(1234)
const weeklyReports = ref(45)

const activeStaff = ref([
  {
    id: 1,
    name: 'John Moderator',
    role: 'Moderator',
    status: 'online',
    lastActive: 'just now',
  },
  {
    id: 2,
    name: 'Sarah Admin',
    role: 'Admin',
    status: 'online',
    lastActive: 'just now',
  },
  {
    id: 3,
    name: 'Mike Moderator',
    role: 'Moderator',
    status: 'away',
    lastActive: '5 min ago',
  },
  {
    id: 4,
    name: 'Lisa Moderator',
    role: 'Moderator',
    status: 'online',
    lastActive: '2 min ago',
  },
  {
    id: 5,
    name: 'David Admin',
    role: 'Admin',
    status: 'offline',
    lastActive: '1 hour ago',
  },
])

const recentActivities = ref([
  {
    id: 1,
    title: 'User report submitted',
    type: 'Report',
    timestamp: '2 minutes ago',
  },
  {
    id: 2,
    title: 'Post flagged for review',
    type: 'Flag',
    timestamp: '5 minutes ago',
  },
  {
    id: 3,
    title: 'User warned',
    type: 'Warning',
    timestamp: '15 minutes ago',
  },
  {
    id: 4,
    title: 'Comment removed',
    type: 'Moderation',
    timestamp: '30 minutes ago',
  },
])

const handleModerationAction = (action) => {
  console.log('Moderation action:', action)
  // TODO: Implement API call to handle moderation action
}

const getActivityColor = (type) => {
  const colors = {
    Report: 'bg-red-500',
    Flag: 'bg-yellow-500',
    Warning: 'bg-orange-500',
    Moderation: 'bg-blue-500',
  }
  return colors[type] || 'bg-gray-500'
}

onMounted(() => {
  // TODO: Fetch dashboard data from API
})
</script>

<style scoped>
@keyframes fade-down {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-down {
  animation: fade-down 0.3s ease-out;
}

.animate-fade-up {
  animation: fade-up 0.3s ease-out;
}

.animate-fade-up-delay {
  animation: fade-up 0.3s ease-out 0.1s both;
}
</style>
