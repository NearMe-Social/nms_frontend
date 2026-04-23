<template>
  <div class="min-h-screen bg-gray-100 p-6">
    <div class="max-w-7xl mx-auto grid grid-cols-12 gap-6">

      <!-- LEFT SIDE -->
      <div class="col-span-8 space-y-6">

        <!-- POST -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
              MAINTENANCE
            </span>
            <span class="text-sm text-gray-400">2 hours ago</span>
          </div>

          <h2 class="text-xl font-semibold mb-3">
            Improving the West Gate lighting
          </h2>

          <div class="flex items-center gap-3 mb-4">
            <img src="https://i.pravatar.cc/40" class="w-10 h-10 rounded-full" />
            <div>
              <p class="font-medium">Marcus Chen</p>
              <p class="text-sm text-gray-400">3 blocks away • Verified</p>
            </div>
          </div>

          <p class="text-gray-600 text-sm leading-relaxed">
            I've noticed that the lighting around the West Gate entrance has been flickering significantly...
          </p>

          <div class="flex gap-6 mt-4 text-sm text-gray-500">
            <span>24 Upvotes</span>
            <span>12 Comments</span>
          </div>
        </div>

        <!-- COMMENTS -->
        <div class="bg-white rounded-xl shadow p-6">
          <h3 class="font-semibold mb-4">Neighbor Conversations</h3>

          <!-- Loading -->
          <div v-if="loading" class="text-gray-400">
            Loading comments...
          </div>

          <!-- Empty -->
          <div v-else-if="comments.length === 0" class="text-gray-400">
            No comments yet
          </div>

          <!-- Comment List -->
          <div v-else class="space-y-4">
            <div
              v-for="comment in comments"
              :key="comment.id"
              class="flex gap-3"
            >
              <img
                src="https://i.pravatar.cc/35"
                class="w-8 h-8 rounded-full"
              />
              <div class="bg-gray-100 p-3 rounded-lg w-full">
                <p class="font-medium text-sm">{{ comment.user }}</p>
                <p class="text-sm text-gray-600">{{ comment.text }}</p>
              </div>
            </div>
          </div>

          <!-- ADD COMMENT FORM -->
          <form @submit.prevent="addComment" class="mt-6 flex gap-3">
            <input
              v-model.trim="newComment"
              type="text"
              placeholder="Add to the conversation..."
              class="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              type="submit"
              class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
            >
              ➤
            </button>
          </form>
        </div>

      </div>

      <!-- RIGHT SIDE -->
      <div class="col-span-4 space-y-6">

        <!-- COMMUNITY PULSE -->
        <div class="bg-white p-5 rounded-xl shadow">
          <h4 class="font-semibold mb-3">Live Community Pulse</h4>

          <div class="h-2 bg-gray-200 rounded-full mb-2">
            <div class="h-2 bg-teal-500 rounded-full w-[88%]"></div>
          </div>

          <p class="text-sm text-gray-500 mb-4">
            Support Strength: High (88%)
          </p>

          <div class="grid grid-cols-2 gap-4 text-center">
            <div class="bg-gray-100 p-3 rounded">
              <p class="font-bold">14</p>
              <p class="text-xs text-gray-500">ACTIVE VOTERS</p>
            </div>
            <div class="bg-gray-100 p-3 rounded">
              <p class="font-bold">2d</p>
              <p class="text-xs text-gray-500">TREND AGE</p>
            </div>
          </div>
        </div>

        <!-- TIPS -->
        <div class="bg-white p-5 rounded-xl shadow">
          <h4 class="font-semibold mb-3">Discussion Tips</h4>
          <ul class="text-sm text-gray-500 space-y-2">
            <li>✔ Stay polite and constructive</li>
            <li>✔ Suggest solutions</li>
            <li>✔ Mention relevant neighbors</li>
          </ul>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const loading = ref(true)
const comments = ref([])
const newComment = ref('')

// Simulate API call
onMounted(() => {
  setTimeout(() => {
    comments.value = [
      { id: 1, user: 'Chantha Mengkorng', text: 'LED lights would be great!' },
      { id: 2, user: 'Heng Ngounhour', text: 'I can help with smart lighting.' }
    ]
    loading.value = false
  }, 1000)
})

const addComment = () => {
  if (!newComment.value) return

  comments.value.push({
    id: Date.now(),
    user: 'You',
    text: newComment.value
  })

  newComment.value = ''
}
</script>