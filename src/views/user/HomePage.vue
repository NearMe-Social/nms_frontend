<!-- <template>
  <div>
    <Navbar />
    <h1>HomePage / Nearby Feed</h1>
  </div>
</template>

<script setup>

import Navbar from '@/components/Navbar.vue'
</script> -->
<template>
  <div class="min-h-screen bg-gray-50">
    <Navbar />

    <div class="w-full px-4 md:px-6 py-6 flex gap-4 xl:gap-6">

      <!-- ── LEFT SIDEBAR ── -->
      <aside class="hidden md:flex w-48 lg:w-56 shrink-0 flex-col gap-5">

        <div>
          <p class="text-base font-bold text-gray-800">Your Commons</p>
          <p class="text-xs text-gray-400 mt-0.5">Within 2 Miles</p>
        </div>

        <nav class="flex flex-col gap-1">
          <a href="#"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-teal-50 text-teal-700">
            <MapPin class="w-4 h-4 shrink-0" /> Local Feed
          </a>
          <a href="#"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition">
            <Crosshair class="w-4 h-4 shrink-0" /> Radius
          </a>
          <a href="#"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition">
            <Users class="w-4 h-4 shrink-0" /> Groups
          </a>
          <a href="#"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition">
            <Bookmark class="w-4 h-4 shrink-0" /> Saved
          </a>
          <a href="#"
            class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-100 transition">
            <ShieldCheck class="w-4 h-4 shrink-0" /> Privacy
          </a>
        </nav>

        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Discovery Radius</p>
          <div class="flex flex-col gap-1.5">
            <button class="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium border bg-white text-gray-500 border-gray-200 hover:bg-gray-50 transition">
              50m
            </button>
            <button class="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-semibold border bg-teal-600 text-white border-teal-600 shadow-sm">
              100m <span class="text-white text-xs">●</span>
            </button>
            <button class="flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium border bg-white text-gray-500 border-gray-200 hover:bg-gray-50 transition">
              200m
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <p class="text-xs font-semibold text-gray-400 uppercase tracking-widest">Sort By</p>
          <div class="flex gap-2">
            <button class="flex-1 py-2 rounded-xl text-xs font-semibold border bg-gray-800 text-white border-gray-800">
              Latest
            </button>
            <button class="flex-1 py-2 rounded-xl text-xs font-semibold border bg-white text-gray-500 border-gray-200 hover:bg-gray-50 transition">
              Active
            </button>
          </div>
        </div>

        <button class="w-full bg-teal-600 hover:bg-teal-700 transition text-white font-semibold py-3 rounded-2xl text-sm shadow-md shadow-teal-100 flex items-center justify-center gap-2">
          <Plus class="w-4 h-4" /> Create Post
        </button>

      </aside>

      <!-- ── MIDDLE FEED ── -->
      <main class="flex-1 flex flex-col gap-4 min-w-0">

        <!-- Mobile sort + create row -->
        <div class="flex md:hidden items-center justify-between gap-2">
          <div class="flex gap-2">
            <button class="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-800 text-white">Latest</button>
            <button class="px-4 py-2 rounded-xl text-xs font-semibold border bg-white text-gray-500 border-gray-200">Active</button>
          </div>
          <button class="bg-teal-600 text-white text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-1">
            <Plus class="w-3 h-3" /> Post
          </button>
        </div>

        <div>
          <h1 class="text-xl md:text-2xl font-bold text-gray-800">Nearby Feed</h1>
          <p class="text-gray-400 text-sm mt-1">See what's happening right now in your immediate circle.</p>
        </div>

        <!-- POST CARD 1 -->
        <div class="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?img=1" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" />
              <div>
                <p class="text-sm font-semibold text-gray-800">Sarah Mitchell</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin class="w-3 h-3" /> 2 Blocks Away
                  </span>
                  <span class="text-xs text-gray-400">4 mins ago</span>
                </div>
              </div>
            </div>
            <span class="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
              <Clock class="w-3 h-3" /> 13m
            </span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            Anyone missing a Golden Retriever? Found one near the fountain at Central Park.
            He's very friendly and has a blue collar with no tag. Keeping him safe on my porch for now!
          </p>
          <img
            src="https://images.unsplash.com/photo-1552053831-71594a27632d?w=500"
            class="w-full h-48 md:h-56 object-cover rounded-xl"
          />
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex gap-1">
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <Heart class="w-4 h-4" /> 24
              </button>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <MessageCircle class="w-4 h-4" /> 8
              </button>
            </div>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
              <Share2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- POST CARD 2 -->
        <div class="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?img=3" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" />
              <div>
                <p class="text-sm font-semibold text-gray-800">David Chen</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin class="w-3 h-3" /> Soon Away
                  </span>
                  <span class="text-xs text-gray-400">2 hours ago</span>
                </div>
              </div>
            </div>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            Spontaneous garage sale! Getting rid of some vintage vinyl and mid-century furniture.
            Come by 142 Oak Lane. Everything must go by sunset.
          </p>
          <div class="grid grid-cols-2 gap-2">
            <img
              src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300"
              class="w-full h-36 md:h-44 object-cover rounded-xl"
            />
            <img
              src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300"
              class="w-full h-36 md:h-44 object-cover rounded-xl"
            />
          </div>
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex gap-1">
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-red-400 bg-red-50">
                <Heart class="w-4 h-4 fill-red-400" /> 42
              </button>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <MessageCircle class="w-4 h-4" /> 15
              </button>
            </div>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
              <Share2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- POST CARD 3 -->
        <div class="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?img=5" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" />
              <div>
                <p class="text-sm font-semibold text-gray-800">Mia Nguyen</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin class="w-3 h-3" /> 50m away
                  </span>
                  <span class="text-xs text-gray-400">10 mins ago</span>
                </div>
              </div>
            </div>
            <span class="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
              <Clock class="w-3 h-3" /> 45m
            </span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            Free coffee samples at the new café on the corner of 3rd and Main!
            Come grab one before they run out ☕
          </p>
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex gap-1">
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <Heart class="w-4 h-4" /> 61
              </button>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <MessageCircle class="w-4 h-4" /> 22
              </button>
            </div>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
              <Share2 class="w-4 h-4" />
            </button>
          </div>
        </div>

        <!-- POST CARD 4 -->
        <div class="bg-white rounded-2xl p-4 md:p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?img=8" class="w-10 h-10 md:w-11 md:h-11 rounded-full object-cover" />
              <div>
                <p class="text-sm font-semibold text-gray-800">James Park</p>
                <div class="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span class="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <MapPin class="w-3 h-3" /> 120m away
                  </span>
                  <span class="text-xs text-gray-400">30 mins ago</span>
                </div>
              </div>
            </div>
            <span class="text-xs bg-orange-50 text-orange-500 border border-orange-200 px-2 py-1 rounded-full shrink-0 flex items-center gap-1">
              <Clock class="w-3 h-3" /> 1h 20m
            </span>
          </div>
          <p class="text-sm text-gray-700 leading-relaxed">
            Anyone want to join a pickup basketball game at the court behind the library? Need 2 more players 🏀
          </p>
          <div class="flex items-center justify-between pt-2 border-t border-gray-100">
            <div class="flex gap-1">
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <Heart class="w-4 h-4" /> 18
              </button>
              <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
                <MessageCircle class="w-4 h-4" /> 9
              </button>
            </div>
            <button class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm text-gray-400 hover:bg-gray-100 transition">
              <Share2 class="w-4 h-4" />
            </button>
          </div>
        </div>

      </main>

      <!-- ── RIGHT PANEL ── -->
      <aside class="hidden lg:flex w-56 xl:w-64 shrink-0 flex-col gap-4">

        <div class="flex items-center gap-2">
          <Zap class="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <p class="text-xs font-bold uppercase tracking-widest text-gray-400">Trending Nearby</p>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-2">
          <p class="text-xs font-semibold text-teal-600 uppercase tracking-wide">Happening Now</p>
          <p class="text-sm font-semibold text-gray-800">Block Party Planning</p>
          <div class="flex items-center mt-1">
            <img v-for="n in 3" :key="n"
              :src="`https://i.pravatar.cc/150?img=${n + 5}`"
              class="w-6 h-6 rounded-full object-cover ring-2 ring-white -ml-1 first:ml-0"
            />
            <span class="text-xs text-gray-400 ml-2">+12 nearby</span>
          </div>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-1">
          <p class="text-xs font-semibold text-red-500 uppercase tracking-wide">Road Closure</p>
          <p class="text-sm font-semibold text-gray-800">Main St Utilities Repair</p>
          <p class="text-xs text-gray-400">Expected until 6 PM</p>
        </div>

        <div class="bg-white rounded-2xl p-4 shadow-sm flex flex-col gap-3">
          <p class="text-sm font-semibold text-gray-800">Neighborhood Poll</p>
          <p class="text-xs text-gray-500 leading-relaxed">
            Should we install more bike racks near the local market?
          </p>
          <div class="flex flex-col gap-2">
            <div>
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-teal-600">Absolutely</span>
                <span class="text-teal-600">68%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-teal-500 h-2 rounded-full" style="width:68%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-xs font-medium mb-1">
                <span class="text-gray-400">Not Necessary</span>
                <span class="text-gray-400">32%</span>
              </div>
              <div class="w-full bg-gray-100 rounded-full h-2">
                <div class="bg-gray-300 h-2 rounded-full" style="width:32%"></div>
              </div>
            </div>
          </div>
          <p class="text-xs text-gray-400">84 neighbors have voted</p>
        </div>

        <div class="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div class="h-36 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative">
            <div class="absolute inset-0 opacity-20"
              style="background-image: repeating-linear-gradient(0deg,#999 0,#999 1px,transparent 1px,transparent 20px), repeating-linear-gradient(90deg,#999 0,#999 1px,transparent 1px,transparent 20px)">
            </div>
            <div class="relative flex flex-col items-center">
              <div class="w-4 h-4 bg-teal-500 rounded-full ring-4 ring-teal-200"></div>
              <div class="w-1 h-3 bg-teal-600 rounded-b-full"></div>
            </div>
          </div>
          <div class="p-3">
            <p class="text-xs text-gray-400 uppercase tracking-wide">Current Location</p>
            <p class="text-sm font-semibold text-gray-700">Phnom Penh District</p>
          </div>
        </div>

      </aside>

    </div>

    <!-- ── MOBILE BOTTOM NAV ── -->
    <div class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex items-center justify-around px-4 py-3 z-50 shadow-lg">
      <RouterLink to="/" class="flex flex-col items-center gap-1 text-teal-600">
        <MapPin class="w-5 h-5" />
        <span class="text-xs font-semibold">Feed</span>
      </RouterLink>
      <RouterLink to="/chat" class="flex flex-col items-center gap-1 text-gray-400">
        <MessageCircle class="w-5 h-5" />
        <span class="text-xs">Chat</span>
      </RouterLink>
      <button class="flex flex-col items-center gap-1 text-gray-400">
        <div class="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center -mt-5 shadow-lg">
          <Plus class="w-5 h-5 text-white" />
        </div>
        <span class="text-xs mt-1">Post</span>
      </button>
      <RouterLink to="/notifications" class="flex flex-col items-center gap-1 text-gray-400">
        <Bell class="w-5 h-5" />
        <span class="text-xs">Alerts</span>
      </RouterLink>
      <RouterLink to="/profile" class="flex flex-col items-center gap-1 text-gray-400">
        <User class="w-5 h-5" />
        <span class="text-xs">Profile</span>
      </RouterLink>
    </div>

  </div>
</template>

<script setup>
import Navbar from '@/components/Navbar.vue'
import {
  MapPin,
  Crosshair,
  Users,
  Bookmark,
  ShieldCheck,
  Bell,
  MessageCircle,
  Plus,
  User,
  Heart,
  Share2,
  Clock,
  Zap
} from 'lucide-vue-next'
</script>