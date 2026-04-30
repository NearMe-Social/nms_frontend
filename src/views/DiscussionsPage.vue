<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import {
	Clock3,
	Filter,
	Heart,
	Lock,
	MapPin,
	MessageSquare,
	MoreHorizontal,
	PencilLine,
	Plus,
	Search,
	Share2,
	Sparkles,
	Globe,
} from 'lucide-vue-next'

type PostStatus = 'published' | 'draft' | 'scheduled'

type MockPost = {
	id: number
	title: string
	body: string
	status: PostStatus
	visibility: number
	timeLabel: string
	likes: number
	comments: number
	shares: number
	reach: string
	category: string
	audience: string
	featured?: boolean
}

const tabs = [
	{ key: 'all', label: 'All posts' },
	{ key: 'published', label: 'Published' },
	{ key: 'draft', label: 'Drafts' },
	{ key: 'scheduled', label: 'Scheduled' },
] as const

const activeTab = ref<(typeof tabs)[number]['key']>('all')
const searchTerm = ref('')

const posts: MockPost[] = [
	{
		id: 1,
		title: 'Community garden watering rota',
		body: 'Looking for 4 volunteers to help cover the evening watering schedule this week. The garden is thriving and a little support will keep it going through the warm stretch.',
		status: 'published',
		visibility: 200,
		timeLabel: '15 minutes ago',
		likes: 28,
		comments: 7,
		shares: 3,
		reach: '128 neighbors',
		category: 'Gardening',
		audience: 'Public to nearby residents',
		featured: true,
	},
	{
		id: 2,
		title: 'Lost parcel at the front gate',
		body: 'A package was left at the west gate earlier today. I moved it to the front desk and left a note for the courier. Sharing here in case it belongs to someone nearby.',
		status: 'published',
		visibility: 100,
		timeLabel: '2 hours ago',
		likes: 16,
		comments: 5,
		shares: 1,
		reach: '74 neighbors',
		category: 'Alerts',
		audience: 'Visible within 100m',
	},
	{
		id: 3,
		title: 'Weekend clean-up invite',
		body: 'Drafting a short invite for a Saturday clean-up around the trail entrance. Need a catchy title and maybe a map pin before I publish.',
		status: 'draft',
		visibility: 50,
		timeLabel: 'Saved today',
		likes: 0,
		comments: 0,
		shares: 0,
		reach: '—',
		category: 'Draft',
		audience: 'Only you can see this draft',
	},
	{
		id: 4,
		title: 'Movie night at the courtyard',
		body: 'Scheduled a small courtyard screening for Friday evening. Added a snack list and a warm reminder for people to bring their own blankets.',
		status: 'scheduled',
		visibility: 200,
		timeLabel: 'Friday, 7:00 PM',
		likes: 0,
		comments: 2,
		shares: 0,
		reach: 'Planned for 140 neighbors',
		category: 'Events',
		audience: 'Scheduled for later tonight',
	},
]

const filteredPosts = computed(() => {
	const needle = searchTerm.value.trim().toLowerCase()

	return posts.filter((post) => {
		const matchesTab = activeTab.value === 'all' || post.status === activeTab.value
		const matchesSearch =
			needle.length === 0 ||
			post.title.toLowerCase().includes(needle) ||
			post.body.toLowerCase().includes(needle) ||
			post.category.toLowerCase().includes(needle)

		return matchesTab && matchesSearch
	})
})

const stats = computed(() => {
	const published = posts.filter((post) => post.status === 'published').length
	const drafts = posts.filter((post) => post.status === 'draft').length
	const scheduled = posts.filter((post) => post.status === 'scheduled').length
	const totalEngagement = posts.reduce((sum, post) => sum + post.likes + post.comments + post.shares, 0)

	return { published, drafts, scheduled, totalEngagement }
})

function statusLabel(status: PostStatus) {
	if (status === 'draft') return 'Draft'
	if (status === 'scheduled') return 'Scheduled'
	return 'Published'
}

function statusClass(status: PostStatus) {
	if (status === 'draft') return 'bg-slate-100 text-slate-600 ring-slate-200'
	if (status === 'scheduled') return 'bg-amber-100 text-amber-800 ring-amber-200'
	return 'bg-emerald-100 text-emerald-700 ring-emerald-200'
}
</script>

<template>
	<div class="min-h-screen bg-[#f3f6fb] text-slate-700">
		<Navbar />

		<div class="mx-auto w-full max-w-[1480px] px-4 py-6 lg:px-6">
			<div class="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)_300px]">
				<aside class="hidden rounded-[28px] bg-white/80 px-5 py-6 shadow-[0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur lg:flex lg:flex-col lg:justify-between">
					<div class="space-y-7">
						<div>
							<p class="text-xl font-extrabold tracking-tight text-slate-800">My Posts</p>
							<p class="mt-1 text-sm text-slate-500">A quick view of your community updates</p>
						</div>

						<nav class="space-y-1.5">
							<button
								v-for="tab in tabs"
								:key="tab.key"
								type="button"
								class="flex w-full items-center justify-between rounded-2xl px-3 py-3 text-left text-sm font-medium transition"
								:class="activeTab === tab.key ? 'bg-cyan-50 text-cyan-900 shadow-sm' : 'text-slate-500 hover:bg-slate-100'"
								@click="activeTab = tab.key"
							>
								<span>{{ tab.label }}</span>
								<span class="text-xs opacity-70">{{ tab.key === 'all' ? posts.length : posts.filter((post) => post.status === tab.key).length }}</span>
							</button>
						</nav>
					</div>

					<RouterLink
						to="/create-post"
						class="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-700 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800"
					>
						<Plus class="h-4 w-4" />
						New Post
					</RouterLink>
				</aside>

				<main class="min-w-0">
					<div class="mb-5 flex flex-wrap items-center justify-between gap-3">
						<div>
							<h1 class="text-[clamp(1.9rem,3vw,2.6rem)] font-extrabold tracking-tight text-slate-800">My Discussions</h1>
							<p class="mt-2 max-w-2xl text-slate-500">Review your published updates, drafts, and scheduled community posts.</p>
						</div>

						<RouterLink
							to="/create-post"
							class="inline-flex items-center gap-2 rounded-2xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-700/20 transition hover:bg-cyan-800"
						>
							<Sparkles class="h-4 w-4" />
							Create Post
						</RouterLink>
					</div>

					<section class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
						<article class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
							<p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Published</p>
							<p class="mt-3 text-3xl font-extrabold text-slate-800">{{ stats.published }}</p>
							<p class="mt-2 text-sm text-slate-500">Posts shared with neighbors</p>
						</article>

						<article class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
							<p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Drafts</p>
							<p class="mt-3 text-3xl font-extrabold text-slate-800">{{ stats.drafts }}</p>
							<p class="mt-2 text-sm text-slate-500">Saved ideas waiting to publish</p>
						</article>

						<article class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
							<p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Scheduled</p>
							<p class="mt-3 text-3xl font-extrabold text-slate-800">{{ stats.scheduled }}</p>
							<p class="mt-2 text-sm text-slate-500">Queued for a later time</p>
						</article>

						<article class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100">
							<p class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Engagement</p>
							<p class="mt-3 text-3xl font-extrabold text-slate-800">{{ stats.totalEngagement }}</p>
							<p class="mt-2 text-sm text-slate-500">Total likes, comments, and shares</p>
						</article>
					</section>

					<section class="mt-6 rounded-[28px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] sm:p-6">
						<div class="flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
							<div class="flex flex-1 items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
								<Search class="h-4 w-4 text-slate-400" />
								<input
									v-model="searchTerm"
									type="text"
									placeholder="Search your posts"
									class="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
								/>
							</div>

							<button class="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100">
								<Filter class="h-4 w-4" />
								Filters
							</button>
						</div>

						<div class="mt-4 flex flex-wrap gap-2">
							<button
								v-for="tab in tabs"
								:key="tab.key"
								type="button"
								class="rounded-full px-4 py-2 text-sm font-semibold transition"
								:class="activeTab === tab.key ? 'bg-cyan-700 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
								@click="activeTab = tab.key"
							>
								{{ tab.label }}
							</button>
						</div>

						<div class="mt-6 space-y-4">
							<article
								v-for="post in filteredPosts"
								:key="post.id"
								class="overflow-hidden rounded-[26px] border border-slate-200 bg-slate-50/70 shadow-sm transition hover:border-cyan-200 hover:shadow-md"
							>
								<div class="flex flex-wrap items-start justify-between gap-4 px-5 py-5">
									<div class="min-w-0 flex-1">
										<div class="flex flex-wrap items-center gap-2">
											<span class="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] ring-1" :class="statusClass(post.status)">
												{{ statusLabel(post.status) }}
											</span>
											<span class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
												{{ post.category }}
											</span>
											<span v-if="post.featured" class="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800 ring-1 ring-cyan-100">
												Featured
											</span>
										</div>

										<h2 class="mt-4 text-xl font-bold tracking-tight text-slate-800">{{ post.title }}</h2>
										<p class="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{{ post.body }}</p>

										<div class="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-500">
											<span class="inline-flex items-center gap-1.5">
												<Clock3 class="h-4 w-4" />
												{{ post.timeLabel }}
											</span>
											<span class="inline-flex items-center gap-1.5">
												<MapPin class="h-4 w-4" />
												{{ post.visibility }}m radius
											</span>
											<span class="inline-flex items-center gap-1.5">
												<Lock v-if="post.status === 'draft'" class="h-4 w-4" />
												<Globe v-else class="h-4 w-4" />
												{{ post.audience }}
											</span>
										</div>
									</div>

									<div class="flex items-center gap-2">
										<button class="rounded-2xl bg-white p-3 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100">
											<PencilLine class="h-4 w-4" />
										</button>
										<button class="rounded-2xl bg-white p-3 text-slate-500 ring-1 ring-slate-200 transition hover:bg-slate-100">
											<MoreHorizontal class="h-4 w-4" />
										</button>
									</div>
								</div>

								<div class="grid gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:grid-cols-3">
									<div class="rounded-2xl bg-slate-50 px-4 py-3">
										<p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Reach</p>
										<p class="mt-1 text-sm font-semibold text-slate-700">{{ post.reach }}</p>
									</div>
									<div class="rounded-2xl bg-slate-50 px-4 py-3">
										<p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Engagement</p>
										<p class="mt-1 text-sm font-semibold text-slate-700">{{ post.likes }} likes · {{ post.comments }} comments · {{ post.shares }} shares</p>
									</div>
									<div class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
										<div>
											<p class="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Status</p>
											<p class="mt-1 text-sm font-semibold text-slate-700">{{ post.status === 'draft' ? 'Saved locally' : post.status === 'scheduled' ? 'Queued' : 'Live now' }}</p>
										</div>
										<div class="flex items-center gap-2 text-slate-400">
											<Heart class="h-4 w-4" />
											<MessageSquare class="h-4 w-4" />
											<Share2 class="h-4 w-4" />
										</div>
									</div>
								</div>
							</article>

							<div v-if="filteredPosts.length === 0" class="rounded-[26px] border border-dashed border-slate-300 bg-slate-50 px-6 py-12 text-center">
								<p class="text-lg font-semibold text-slate-700">No posts match your search</p>
								<p class="mt-2 text-sm text-slate-500">Try a different keyword or switch to another tab.</p>
							</div>
						</div>
					</section>
				</main>

				<aside class="space-y-5">
					<section class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
						<h2 class="flex items-center gap-2 text-lg font-semibold text-cyan-900">
							<Sparkles class="h-4 w-4" />
							Posting Overview
						</h2>
						<div class="mt-4 space-y-3 text-sm text-slate-600">
							<p>Use this space to review recent posts before making the next update.</p>
							<div class="rounded-2xl bg-cyan-50 px-4 py-3 text-cyan-900 ring-1 ring-cyan-100">
								<p class="font-semibold">Most active radius</p>
								<p class="mt-1 text-sm">100m and 200m posts get the highest response rate.</p>
							</div>
						</div>
					</section>

					<section class="rounded-[24px] bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.07)]">
						<h3 class="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Quick Actions</h3>
						<div class="mt-4 space-y-3">
							<RouterLink
								to="/create-post"
								class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
							>
								Compose new post
								<Plus class="h-4 w-4 text-cyan-700" />
							</RouterLink>
							<RouterLink
								to="/discussion"
								class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-100"
							>
								Open a discussion thread
								<MessageSquare class="h-4 w-4 text-cyan-700" />
							</RouterLink>
						</div>
					</section>

					<section class="rounded-[24px] bg-gradient-to-br from-cyan-900 to-slate-900 px-5 py-5 text-white shadow-[0_10px_30px_rgba(15,23,42,0.12)]">
						<p class="text-xs font-bold uppercase tracking-[0.24em] text-cyan-100/80">Draft reminder</p>
						<p class="mt-3 text-lg font-semibold">You have one draft ready to polish.</p>
						<p class="mt-2 text-sm leading-6 text-cyan-100/80">Fill the title, content, and visibility radius, then publish when the post is ready.</p>
					</section>
				</aside>
			</div>
		</div>
	</div>
</template>
