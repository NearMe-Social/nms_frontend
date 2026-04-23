<template>
  <div class="bg-white rounded-xl shadow p-6">

    <!-- TITLE -->
    <h3 class="font-semibold mb-4">Comments</h3>

    <!--  LOADING STATE -->
    <div v-if="loading" class="text-gray-400">
      Loading comments...
    </div>

    <!--  EMPTY STATE -->
    <div v-else-if="comments.length === 0" class="text-gray-400">
      No comments yet. Be the first!
    </div>

    <!-- COMMENTS LIST -->
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

    <!--  ADD COMMENT FORM -->
    <div class="mt-6 flex gap-3">
      <input
        v-model="newComment"
        placeholder="Write a comment..."
        class="flex-1 border rounded-lg px-4 py-2"
      />

      <button
        @click="addComment"
        class="bg-teal-600 text-white px-4 py-2 rounded-lg hover:bg-teal-700"
      >
        ➤
      </button>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// STATE
const loading = ref(true)
const comments = ref([])
const newComment = ref('')

// MOCK DATA (simulate API)
onMounted(() => {
  setTimeout(() => {
    comments.value = [
      { id: 1, user: 'Mesa', text: 'This is really helpful!' },
      { id: 2, user: 'Dara', text: 'I agree with this discussion.' }
    ]
    loading.value = false
  }, 1000)
})

// ADD COMMENT
const addComment = () => {
  if (!newComment.value.trim()) return

  comments.value.push({
    id: Date.now(),
    user: 'You',
    text: newComment.value
  })

  newComment.value = ''
}
</script>