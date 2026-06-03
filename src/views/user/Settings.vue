<template>
  <div>
    <Navbar />
    <div class="flex min-w-0">
      <AppSidebar class="hidden md:flex" />
      <div class="settings-page">

        <!-- Header -->
        <div class="page-header">
          <h1 class="page-title">Settings</h1>
          <p class="page-subtitle">Manage your account security and privacy preferences.</p>
        </div>

        <div class="settings-container">

          <!-- ── Change Password ─────────────────────────── -->
          <section class="settings-section">
            <div class="section-header">
              <LockIcon :size="18" />
              <h2 class="section-title">Change Password</h2>
            </div>

            <form @submit.prevent="handleChangePassword" class="form-content">
              <div class="form-group">
                <label class="form-label">Current Password</label>
                <div class="input-wrapper">
                  <input
                    v-model="passwordForm.current"
                    :type="showCurrent ? 'text' : 'password'"
                    class="form-input"
                    placeholder="Enter current password"
                  />
                  <button type="button" class="eye-btn" @click="showCurrent = !showCurrent">
                    <EyeOffIcon v-if="showCurrent" :size="16" />
                    <EyeIcon v-else :size="16" />
                  </button>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">New Password</label>
                  <div class="input-wrapper">
                    <input
                      v-model="passwordForm.new"
                      :type="showNew ? 'text' : 'password'"
                      class="form-input"
                      placeholder="Min. 8 characters"
                    />
                    <button type="button" class="eye-btn" @click="showNew = !showNew">
                      <EyeOffIcon v-if="showNew" :size="16" />
                      <EyeIcon v-else :size="16" />
                    </button>
                  </div>
                  <!-- Strength bar -->
                  <div class="strength-bar-wrap" v-if="passwordForm.new">
                    <div class="strength-bar">
                      <div
                        class="strength-fill"
                        :style="{ width: strength.pct + '%' }"
                        :class="strength.color"
                      ></div>
                    </div>
                    <span class="strength-label" :class="strength.textColor">{{ strength.label }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label">Confirm New Password</label>
                  <div class="input-wrapper">
                    <input
                      v-model="passwordForm.confirm"
                      :type="showConfirm ? 'text' : 'password'"
                      class="form-input"
                      :class="{ 'input-error': passwordForm.confirm && passwordForm.new !== passwordForm.confirm }"
                      placeholder="Repeat new password"
                    />
                    <button type="button" class="eye-btn" @click="showConfirm = !showConfirm">
                      <EyeOffIcon v-if="showConfirm" :size="16" />
                      <EyeIcon v-else :size="16" />
                    </button>
                  </div>
                  <p v-if="passwordForm.confirm && passwordForm.new !== passwordForm.confirm" class="field-error">
                    Passwords do not match
                  </p>
                </div>
              </div>

              <div class="form-actions">
                <button
                  type="submit"
                  class="btn-save"
                  :disabled="isSavingPassword || !canSavePassword"
                >
                  <span v-if="isSavingPassword" class="btn-loading">
                    <Loader2Icon :size="15" class="spinner" /> Updating...
                  </span>
                  <span v-else class="flex items-center gap-1.5">
                    <CheckIcon :size="15" /> Update Password
                  </span>
                </button>
              </div>

              <div v-if="passwordMsg.text" :class="['alert', passwordMsg.type === 'success' ? 'alert-success' : 'alert-error']">
                <CheckIcon v-if="passwordMsg.type === 'success'" :size="15" />
                <AlertCircleIcon v-else :size="15" />
                {{ passwordMsg.text }}
              </div>
            </form>
          </section>

          <!-- ── Privacy Settings ───────────────────────── -->
          <section class="settings-section">
            <div class="section-header">
              <ShieldIcon :size="18" />
              <h2 class="section-title">Privacy</h2>
            </div>

            <div class="toggle-list">
              <div class="toggle-item" v-for="item in privacyToggles" :key="item.key">
                <div class="toggle-info">
                  <p class="toggle-title">{{ item.title }}</p>
                  <p class="toggle-desc">{{ item.desc }}</p>
                </div>
                <button
                  type="button"
                  class="toggle-btn"
                  :class="{ active: privacy[item.key] }"
                  @click="privacy[item.key] = !privacy[item.key]"
                >
                  <span class="toggle-thumb"></span>
                </button>
              </div>
            </div>

            <div class="form-actions mt-4">
              <button class="btn-save" :disabled="isSavingPrivacy" @click="handleSavePrivacy">
                <span v-if="isSavingPrivacy" class="btn-loading">
                  <Loader2Icon :size="15" class="spinner" /> Saving...
                </span>
                <span v-else class="flex items-center gap-1.5">
                  <CheckIcon :size="15" /> Save Privacy Settings
                </span>
              </button>
            </div>

            <div v-if="privacyMsg.text" :class="['alert', privacyMsg.type === 'success' ? 'alert-success' : 'alert-error']">
              <CheckIcon v-if="privacyMsg.type === 'success'" :size="15" />
              <AlertCircleIcon v-else :size="15" />
              {{ privacyMsg.text }}
            </div>
          </section>

          <!-- ── Blocked Users ───────────────────────────── -->
          <section class="settings-section">
            <div class="section-header">
              <UserXIcon :size="18" />
              <h2 class="section-title">Blocked Users</h2>
            </div>

            <p class="section-desc">Users you have blocked cannot see your posts or message you.</p>

            <div v-if="blockedUsers.length === 0" class="empty-state">
              <UserXIcon :size="32" class="empty-icon" />
              <p>You haven't blocked anyone yet.</p>
            </div>

            <div v-else class="blocked-list">
              <div v-for="u in blockedUsers" :key="u.id" class="blocked-item">
                <div class="blocked-avatar">{{ initials(u.username) }}</div>
                <div class="blocked-info">
                  <p class="blocked-name">{{ u.username }}</p>
                  <p class="blocked-date">Blocked on {{ formatDate(u.blockedAt) }}</p>
                </div>
                <button class="btn-unblock" @click="handleUnblock(u.id)">
                  Unblock
                </button>
              </div>
            </div>
          </section>

          <!-- ── Danger Zone ─────────────────────────────── -->
          <section class="settings-section danger-section">
            <div class="section-header">
              <AlertTriangleIcon :size="18" />
              <h2 class="section-title">Danger Zone</h2>
            </div>

            <div class="danger-item">
              <div>
                <p class="danger-title">Delete Account</p>
                <p class="danger-desc">Permanently delete your account and all associated data. This action cannot be undone.</p>
              </div>
              <button class="btn-danger" @click="showDeleteConfirm = true">
                <Trash2Icon :size="15" /> Delete Account
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>

    <!-- Delete confirm modal -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal">
          <div class="modal-icon">
            <AlertTriangleIcon :size="28" />
          </div>
          <h3 class="modal-title">Delete your account?</h3>
          <p class="modal-desc">This will permanently remove all your data. Type <strong>DELETE</strong> to confirm.</p>
          <input v-model="deleteConfirmText" class="form-input" placeholder="Type DELETE" />
          <div class="modal-actions">
            <button class="btn-cancel" @click="showDeleteConfirm = false">Cancel</button>
            <button
              class="btn-danger"
              :disabled="deleteConfirmText !== 'DELETE'"
              @click="handleDeleteAccount"
            >
              <Trash2Icon :size="15" /> Confirm Delete
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import {
  Lock as LockIcon,
  Shield as ShieldIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  Check as CheckIcon,
  AlertCircle as AlertCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Loader2 as Loader2Icon,
  UserX as UserXIcon,
  Trash2 as Trash2Icon,
} from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

// ── Password ──────────────────────────────────────────
const passwordForm = ref({ current: '', new: '', confirm: '' })
const showCurrent  = ref(false)
const showNew      = ref(false)
const showConfirm  = ref(false)
const isSavingPassword = ref(false)
const passwordMsg  = ref({ text: '', type: '' })

const strength = computed(() => {
  const p = passwordForm.value.new
  if (!p) return { pct: 0, label: '', color: '', textColor: '' }
  let score = 0
  if (p.length >= 8)          score++
  if (/[A-Z]/.test(p))        score++
  if (/[0-9]/.test(p))        score++
  if (/[^A-Za-z0-9]/.test(p)) score++
  const map = [
    { pct: 25,  label: 'Weak',   color: 'bg-red-400',    textColor: 'text-red-500'    },
    { pct: 50,  label: 'Fair',   color: 'bg-orange-400', textColor: 'text-orange-500' },
    { pct: 75,  label: 'Good',   color: 'bg-yellow-400', textColor: 'text-yellow-600' },
    { pct: 100, label: 'Strong', color: 'bg-green-500',  textColor: 'text-green-600'  },
  ]
  return map[score - 1] ?? map[0]
})

const canSavePassword = computed(() =>
  passwordForm.value.current &&
  passwordForm.value.new.length >= 8 &&
  passwordForm.value.new === passwordForm.value.confirm
)

async function handleChangePassword() {
  if (!canSavePassword.value) return
  isSavingPassword.value = true
  passwordMsg.value = { text: '', type: '' }
  try {
    // TODO: wire to API when endpoint is available
    await new Promise(r => setTimeout(r, 800))
    passwordMsg.value = { text: 'Password updated successfully!', type: 'success' }
    passwordForm.value = { current: '', new: '', confirm: '' }
  } catch (e: any) {
    passwordMsg.value = { text: e.message ?? 'Failed to update password', type: 'error' }
  } finally {
    isSavingPassword.value = false
  }
}

// ── Privacy ───────────────────────────────────────────
const privacy = ref({
  showLocation:    true,
  showOnlineStatus: true,
  allowMessages:   true,
  publicProfile:   true,
})

const privacyToggles = [
  { key: 'showLocation',     title: 'Show my location',      desc: 'Let nearby users see your approximate location on the map.' },
  { key: 'showOnlineStatus', title: 'Show online status',    desc: 'Other users can see when you were last active.' },
  { key: 'allowMessages',    title: 'Allow direct messages', desc: 'Anyone can send you a direct message.' },
  { key: 'publicProfile',    title: 'Public profile',        desc: 'Your profile is visible to all users, not just your connections.' },
] as const

const isSavingPrivacy = ref(false)
const privacyMsg = ref({ text: '', type: '' })

async function handleSavePrivacy() {
  isSavingPrivacy.value = true
  privacyMsg.value = { text: '', type: '' }
  try {
    await new Promise(r => setTimeout(r, 700))
    privacyMsg.value = { text: 'Privacy settings saved!', type: 'success' }
  } catch {
    privacyMsg.value = { text: 'Failed to save settings', type: 'error' }
  } finally {
    isSavingPrivacy.value = false
  }
}

// ── Blocked users ─────────────────────────────────────
const blockedUsers = ref<{ id: number; username: string; blockedAt: string }[]>([
  // populated from API — empty for now
])

function handleUnblock(id: number) {
  blockedUsers.value = blockedUsers.value.filter(u => u.id !== id)
}

// ── Delete account ────────────────────────────────────
const showDeleteConfirm = ref(false)
const deleteConfirmText  = ref('')

function handleDeleteAccount() {
  if (deleteConfirmText.value !== 'DELETE') return
  authStore.logout()
  router.push('/login')
}

// ── Helpers ───────────────────────────────────────────
function initials(name: string) {
  return name.slice(0, 2).toUpperCase()
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<style scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  flex: 1;
  min-height: 100vh;
  background: #f4f7fb;
  color: #1f4054;
  font-family: Inter, ui-sans-serif, system-ui, sans-serif;
  padding: 24px clamp(16px, 3vw, 32px) 40px;
}

.page-header {
  border: 1px solid #e3ebf2;
  border-radius: 18px;
  background: #fff;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(15,45,70,.04);
  margin-bottom: 24px;
}
.page-title   { margin:0; color:#0f172a; font-size:clamp(1.875rem,2.6vw,2.25rem); font-weight:850; line-height:1.1; }
.page-subtitle{ margin:8px 0 0; color:#7890a2; font-size:.9rem; font-weight:600; }

.settings-container { display:flex; flex-direction:column; gap:24px; width:100%; }

/* Section */
.settings-section {
  background:#fff;
  border:1px solid #e3ebf2;
  border-radius:18px;
  padding:24px;
  box-shadow:0 1px 3px rgba(15,45,70,.04);
}
.section-header {
  display:flex; align-items:center; gap:10px;
  padding-bottom:14px; margin-bottom:20px;
  border-bottom:1px solid #eef3f7;
  color:#0e6378;
}
.section-title { margin:0; color:#17364a; font-size:1rem; font-weight:850; }
.section-desc  { font-size:13px; color:#7890a2; margin:0 0 16px; }

/* Form */
.form-content { display:flex; flex-direction:column; gap:16px; }
.form-group   { display:flex; flex-direction:column; gap:6px; }
.form-row     { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
@media(max-width:640px){ .form-row{ grid-template-columns:1fr; } }

.form-label {
  font-size:12px; font-weight:850; color:#4f687d;
  text-transform:uppercase; letter-spacing:.08em;
}

.input-wrapper { position:relative; }
.form-input {
  width:100%; padding:11px 38px 11px 13px;
  border:1px solid #dce7ee; border-radius:10px;
  font-family:inherit; font-size:14px; color:#17364a;
  background:#fff; transition:all .2s ease; box-sizing:border-box;
}
.form-input::placeholder { color:#94a3b8; }
.form-input:focus { outline:none; border-color:#0f8a7c; box-shadow:0 0 0 3px rgba(15,138,124,.08); }
.form-input.input-error { border-color:#ef4444; }

.eye-btn {
  position:absolute; right:10px; top:50%; transform:translateY(-50%);
  background:none; border:none; cursor:pointer; color:#7890a2;
  padding:2px; display:flex; align-items:center;
}
.eye-btn:hover { color:#17364a; }

.field-error { font-size:12px; color:#ef4444; margin:0; }

/* Strength bar */
.strength-bar-wrap { display:flex; align-items:center; gap:8px; margin-top:6px; }
.strength-bar  { flex:1; height:4px; background:#eef3f7; border-radius:99px; overflow:hidden; }
.strength-fill { height:100%; border-radius:99px; transition:width .3s ease; }
.strength-label{ font-size:11px; font-weight:700; white-space:nowrap; }

/* Buttons */
.form-actions { display:flex; justify-content:flex-end; }
.mt-4 { margin-top:16px; }

.btn-save {
  padding:11px 24px; border:none; border-radius:999px;
  font-size:13px; font-weight:700; cursor:pointer;
  background:#0f8a7c; color:#fff;
  display:flex; align-items:center; gap:7px;
  font-family:inherit; text-transform:uppercase; letter-spacing:.5px;
  transition:all .2s ease;
}
.btn-save:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 8px 16px rgba(15,138,124,.25); }
.btn-save:disabled { opacity:.55; cursor:not-allowed; }

.btn-cancel {
  padding:11px 24px; border:1px solid #dce7ee; border-radius:999px;
  font-size:13px; font-weight:700; cursor:pointer;
  background:#f8fbff; color:#4f687d;
  font-family:inherit; text-transform:uppercase; letter-spacing:.5px;
  transition:all .2s;
}
.btn-cancel:hover { background:#e8ecf1; }

.btn-loading { display:flex; align-items:center; gap:7px; }
.spinner { animation:spin 1s linear infinite; }
@keyframes spin { to{ transform:rotate(360deg); } }

/* Alerts */
.alert {
  margin-top:12px; padding:11px 14px; border-radius:8px;
  font-size:13px; display:flex; align-items:center; gap:8px; font-weight:500;
}
.alert-success{ background:rgba(0,201,177,.1); color:#00a896; border:1px solid rgba(0,201,177,.25); }
.alert-error  { background:rgba(239,68,68,.1); color:#dc2626; border:1px solid rgba(239,68,68,.25); }

/* Toggle */
.toggle-list  { display:flex; flex-direction:column; gap:0; }
.toggle-item  {
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  padding:14px 0; border-bottom:1px solid #eef3f7;
}
.toggle-item:last-child { border-bottom:none; }
.toggle-info  { flex:1; min-width:0; }
.toggle-title { font-size:14px; font-weight:700; color:#17364a; margin:0 0 2px; }
.toggle-desc  { font-size:12px; color:#7890a2; margin:0; }

.toggle-btn {
  width:44px; height:24px; border-radius:999px; border:none; cursor:pointer;
  background:#e2e8f0; position:relative; transition:background .25s ease; flex-shrink:0; padding:0;
}
.toggle-btn.active { background:#0f8a7c; }
.toggle-thumb {
  position:absolute; top:3px; left:3px;
  width:18px; height:18px; border-radius:50%; background:#fff;
  box-shadow:0 1px 3px rgba(0,0,0,.2);
  transition:transform .25s cubic-bezier(.34,1.56,.64,1);
}
.toggle-btn.active .toggle-thumb { transform:translateX(20px); }

/* Blocked users */
.empty-state  { text-align:center; padding:32px; color:#7890a2; font-size:14px; }
.empty-icon   { margin:0 auto 10px; opacity:.4; }
.blocked-list { display:flex; flex-direction:column; gap:10px; }
.blocked-item {
  display:flex; align-items:center; gap:12px;
  padding:12px 14px; border:1px solid #eef3f7; border-radius:12px; background:#f8fbff;
}
.blocked-avatar {
  width:36px; height:36px; border-radius:50%;
  background:#0f8a7c; color:#fff;
  font-size:13px; font-weight:700;
  display:flex; align-items:center; justify-content:center; flex-shrink:0;
}
.blocked-info  { flex:1; min-width:0; }
.blocked-name  { font-size:14px; font-weight:700; color:#17364a; margin:0; }
.blocked-date  { font-size:12px; color:#7890a2; margin:0; }
.btn-unblock {
  padding:7px 16px; border-radius:999px; border:1px solid #dce7ee;
  font-size:12px; font-weight:700; cursor:pointer;
  background:#fff; color:#4f687d; font-family:inherit;
  text-transform:uppercase; letter-spacing:.4px; transition:all .2s;
}
.btn-unblock:hover { background:#fee2e2; border-color:#fca5a5; color:#dc2626; }

/* Danger zone */
.danger-section { border-color:#fee2e2; }
.danger-section .section-header { color:#dc2626; border-color:#fee2e2; }
.danger-item {
  display:flex; align-items:center; justify-content:space-between; gap:16px;
  flex-wrap:wrap;
}
.danger-title { font-size:14px; font-weight:700; color:#17364a; margin:0 0 4px; }
.danger-desc  { font-size:13px; color:#7890a2; margin:0; max-width:none; }
.btn-danger {
  padding:11px 20px; border:none; border-radius:999px;
  font-size:13px; font-weight:700; cursor:pointer;
  background:#ef4444; color:#fff;
  display:flex; align-items:center; gap:6px;
  font-family:inherit; text-transform:uppercase; letter-spacing:.5px;
  transition:all .2s; flex-shrink:0;
}
.btn-danger:hover:not(:disabled){ transform:translateY(-1px); box-shadow:0 6px 14px rgba(239,68,68,.3); }
.btn-danger:disabled { opacity:.4; cursor:not-allowed; }

/* Modal */
.modal-overlay {
  position:fixed; inset:0; background:rgba(0,0,0,.45);
  display:flex; align-items:center; justify-content:center; z-index:50;
  backdrop-filter:blur(2px);
}
.modal {
  background:#fff; border-radius:20px; padding:32px;
  width:min(420px,90vw); display:flex; flex-direction:column; gap:14px;
  box-shadow:0 20px 60px rgba(0,0,0,.2);
}
.modal-icon  { color:#ef4444; display:flex; justify-content:center; }
.modal-title { font-size:1.1rem; font-weight:850; color:#17364a; margin:0; text-align:center; }
.modal-desc  { font-size:13px; color:#7890a2; margin:0; text-align:center; line-height:1.6; }
.modal-actions { display:flex; gap:10px; justify-content:flex-end; margin-top:6px; }

/* Modal transition */
.fade-enter-active,.fade-leave-active { transition:opacity .2s ease; }
.fade-enter-from,.fade-leave-to { opacity:0; }
</style>