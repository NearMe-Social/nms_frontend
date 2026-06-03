<template>
  <div class="controls-wrap">
   
    <Teleport to="body">
      <div v-if="confirming" class="confirm-overlay" @click.self="confirming = null">
        <div class="confirm-dialog">
          <div class="confirm-icon" :class="confirming">
            <BanIcon v-if="confirming === 'suspend'" />
            <CheckIcon v-else />
          </div>
          <h4 class="confirm-title">{{ confirming === 'suspend' ? 'Suspend User?' : 'Reactivate User?' }}</h4>
          <p class="confirm-desc">
            {{ confirming === 'suspend'
              ? 'This user will lose access until manually reactivated.'
              : 'This user will regain full access to the platform.' }}
          </p>
          <div class="confirm-actions">
            <button class="c-btn cancel" @click="confirming = null">Cancel</button>
            <button class="c-btn" :class="confirming === 'suspend' ? 'danger' : 'success'" @click="confirm">
              {{ confirming === 'suspend' ? 'Yes, Suspend' : 'Yes, Activate' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

   
    <template v-if="variant === 'row'">
      <button v-if="status === 'active' || status === 'pending'" class="ctrl-btn suspend" @click="ask('suspend')" :title="'Suspend user'">
        <PauseIcon /> Suspend
      </button>
      <button v-if="status === 'suspended' || status === 'banned' || status === 'inactive'" class="ctrl-btn activate" @click="ask('activate')" :title="'Activate user'">
        <CheckIcon /> Activate
      </button>
      <button class="ctrl-btn more" @click="moreOpen = !moreOpen">
        <DotsIcon />
      </button>
      <div v-if="moreOpen" class="more-menu" v-click-outside="() => moreOpen = false">
        <button class="menu-item" @click="emit('view', userId); moreOpen = false"><EyeIcon /> View Profile</button>
        <button class="menu-item" @click="emit('warn', userId); moreOpen = false"><AlertIcon /> Send Warning</button>
      </div>
    </template>

   
    <template v-if="variant === 'block'">
      <button v-if="status !== 'suspended' && status !== 'banned'" class="block-btn suspend" @click="ask('suspend')">
        <PauseIcon class="bico" /> Suspend Account
      </button>
      <button v-if="status === 'suspended'" class="block-btn activate" @click="ask('activate')">
        <CheckIcon class="bico" /> Reactivate Account
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  status: { type: String, required: true },
  userId: { type: [String, Number], required: true },
  variant: { type: String, default: 'row' }, 
})

const emit = defineEmits(['suspend', 'activate', 'ban', 'warn', 'view'])

const PauseIcon = { template: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>` }
const CheckIcon = { template: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>` }
const BanIcon = { template: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>` }
const DotsIcon = { template: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>` }
const EyeIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>` }
const AlertIcon = { template: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>` }

const confirming = ref(null)
const moreOpen = ref(false)

function ask(action) { confirming.value = action; moreOpen.value = false }
function confirm() {
  if (confirming.value === 'suspend') emit('suspend', props.userId)
  else emit('activate', props.userId)
  confirming.value = null
}


const vClickOutside = { mounted(el, { value }) { el._clickOut = e => { if (!el.contains(e.target)) value(e) }; document.addEventListener('click', el._clickOut) }, unmounted(el) { document.removeEventListener('click', el._clickOut) } }
</script>

<style scoped>
*, *::before, *::after { 
    box-sizing: border-box; 
    margin: 0; 
    padding: 0; 
}

.controls-wrap { 
    display: flex; 
    align-items: center; 
    gap: 5px; 
    position: relative; 
}


.ctrl-btn { 
    display: inline-flex; 
    align-items: center; 
    gap: 4px; 
    padding: 5px 10px; 
    border-radius: 6px; 
    border: 1px solid; 
    font-size: 12px; 
    font-weight: 500; 
    cursor: pointer; 
    transition: all .15s; 
    white-space: nowrap; 
}

.ctrl-btn.suspend { 
    background: #fff7ed; 
    color: #c2410c; 
    border-color: #fed7aa; 
}

.ctrl-btn.suspend:hover { 
    background: #ffedd5; 
}

.ctrl-btn.activate { 
    background: #dcfce7; 
    color: #15803d; 
    border-color: #bbf7d0; 
}

.ctrl-btn.activate:hover { 
    background: #bbf7d0; 
}

.ctrl-btn.more { 
    background: #f9fafb; 
    color: #6b7280; 
    border-color: #e5e7eb; 
    padding: 5px 7px; 
}

.ctrl-btn.more:hover { 
    background: #f3f4f6; 
}


.more-menu { 
    position: absolute; 
    right: 0; 
    top: calc(100% + 4px); 
    background: #fff; 
    border: 1px solid #e8e9ec; 
    border-radius: 9px; 
    box-shadow: 0 8px 24px rgba(0,0,0,.1); 
    z-index: 100; 
    min-width: 160px; 
    overflow: hidden; 
}

.menu-item { 
    display: flex; 
    align-items: center; 
    gap: 8px; 
    width: 100%; 
    padding: 9px 13px; 
    border: none; 
    background: transparent; 
    font-size: 13px; 
    color: #374151; 
    cursor: pointer; 
    text-align: left; 
    transition: background .12s; 
}

.menu-item:hover { 
    background: #f9fafb; 
}

.menu-item.danger { 
    color: #dc2626; 
}

.menu-item.danger:hover { 
    background: #fef2f2; 
}


.block-btn { 
    display: flex; 
    align-items: center; 
    gap: 6px; 
    padding: 9px 16px; 
    border-radius: 8px; 
    border: 1px solid; 
    font-size: 13px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all .15s; 
    width: 100%; 
}

.block-btn.suspend { 
    background: #fff7ed; 
    color: #c2410c; 
    border-color: #fed7aa;
}

.block-btn.suspend:hover { 
    background: #ffedd5; 
}

.block-btn.activate { 
    background: #dcfce7; 
    color: #15803d; 
    border-color: #bbf7d0; 
}

.block-btn.activate:hover { 
    background: #bbf7d0; 
}

.block-btn.ban { 
    background: #fef2f2; 
    color: #b91c1c; 
    border-color: #fecaca; 
    margin-top: 6px; 
}

.block-btn.ban:hover { 
    background: #fee2e2; 
}

.bico { 
    flex-shrink: 0; 
}


.confirm-overlay { 
    position: fixed; 
    inset: 0; 
    background: rgba(16,18,28,.45); 
    backdrop-filter: blur(4px); 
    display: grid; 
    place-items: center; 
    z-index: 1000; 
}

.confirm-dialog { 
    background: #fff; 
    border-radius: 14px; 
    padding: 28px; 
    width: 320px; 
    box-shadow: 0 24px 48px rgba(0,0,0,.15); 
    text-align: center; 
}

.confirm-icon { 
    width: 48px; 
    height: 48px; 
    border-radius: 50%; 
    display: grid; 
    place-items: center; 
    margin: 0 auto 14px; 
}

.confirm-icon.suspend { 
    background: #fff7ed; 
    color: #c2410c; 
}

.confirm-icon.activate { 
    background: #dcfce7; 
    color: #15803d; 
}

.confirm-title { 
    font-size: 16px; 
    font-weight: 700; 
    color: #16181d; 
    margin-bottom: 8px; 
}

.confirm-desc { 
    font-size: 13px; 
    color: #6b7080; 
    line-height: 1.5; 
    margin-bottom: 20px; 
}

.confirm-actions { 
    display: flex; 
    gap: 8px; 
}

.c-btn { 
    flex: 1; 
    padding: 9px; 
    border-radius: 8px; 
    border: 1px solid; 
    font-size: 13px; 
    font-weight: 600; 
    cursor: pointer; 
    transition: all .15s; 
}

.c-btn.cancel { 
    background: #f9fafb; 
    color: #374151; 
    border-color: #e5e7eb; 
}

.c-btn.cancel:hover { 
    background: #f3f4f6; 
}

.c-btn.danger { 
    background: #dc2626; 
    color: #fff; 
    border-color: #dc2626; 
}

.c-btn.danger:hover { 
    background: #b91c1c; 
}

.c-btn.success { 
    background: #16a34a; 
    color: #fff; 
    border-color: #16a34a; 
}

.c-btn.success:hover { 
    background: #15803d; 
}

</style>
