<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="flex">
      <AppSidebar class="hidden md:flex" />

      <main class="mx-auto flex w-full max-w-3xl flex-col gap-5 px-4 py-6 md:px-8">
        <div>
          <h1 class="text-2xl font-bold text-gray-800">Create Discussion</h1>
          <p class="mt-1 text-sm text-gray-500">
            Share something with nearby users. Exact location stays hidden.
          </p>
        </div>

        <form class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div class="flex flex-col gap-4">
            <label class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-gray-700">Title</span>
              <input
                class="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                placeholder="What should neighbors know?"
              />
            </label>

            <label class="flex flex-col gap-2">
              <span class="text-sm font-semibold text-gray-700">Content</span>
              <textarea
                class="min-h-40 resize-y rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-teal-500"
                placeholder="Write the details..."
              ></textarea>
            </label>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="rounded-xl border border-teal-200 bg-teal-50 p-4">
                <input type="radio" name="visibility" checked />
                <span class="ml-2 text-sm font-semibold text-teal-800">Public nearby</span>
                <p class="mt-1 text-xs text-teal-700">Visible inside your selected radius.</p>
              </label>
              <label class="rounded-xl border border-gray-200 bg-white p-4">
                <input type="radio" name="visibility" />
                <span class="ml-2 text-sm font-semibold text-gray-700">Private discussion</span>
                <p class="mt-1 text-xs text-gray-500">Invite selected nearby users later.</p>
              </label>
            </div>

            <div class="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
              <p class="text-xs text-gray-500">Moderation checks should run before publishing.</p>
              <RouterLink
                to="/discussion"
                class="rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white no-underline"
              >
                Preview Discussion
              </RouterLink>
            </div>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
</script>
