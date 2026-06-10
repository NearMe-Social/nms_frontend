<template>
  <div class="select-profile-page">
    <header class="profile-header">
      <h1>Nearme</h1>
      <button class="skip-btn" @click="handleSkip">Skip</button>
    </header>

    <main class="profile-main">
      <section class="profile-card">
        <div class="profile-content">
          <h2 class="profile-title">Select your profile</h2>
          <p class="profile-subtitle">Set up your identity to connect with the local community.</p>

          <div class="avatar-section">
            <UserAvatar
              :src="auth.user?.profile_image"
              :username="auth.user?.username"
              alt="Profile picture"
              class="avatar-placeholder avatar-image"
            />
          </div>

          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label for="username">USERNAME</label>
              <div class="input-wrapper">
                <input
                  type="text"
                  id="username"
                  placeholder="Select a unique username"
                  v-model="username"
                  required
                  @input="validateUsername"
                />
                <span class="input-suffix">@</span>
              </div>
              <p v-if="usernameError" class="error-text">{{ usernameError }}</p>
            </div>

            <div class="pro-tip">
              <div class="pro-tip-header">
                <svg viewBox="0 0 24 24" fill="currentColor" class="pro-tip-icon">
                  <circle cx="12" cy="12" r="10"></circle>
                  <text
                    x="12"
                    y="16"
                    text-anchor="middle"
                    font-size="14"
                    fill="white"
                    font-weight="bold"
                  >
                    i
                  </text>
                </svg>
                <span>PRO TIP</span>
              </div>
              <p class="pro-tip-text">
                Choose a unique handle so neighbors can recognize you easily.
              </p>
            </div>

            <button type="submit" class="start-btn" :disabled="isLoading || !username.trim()">
              {{ isLoading ? 'Connecting...' : 'Start Connecting' }}
            </button>
          </form>
        </div>

        <footer class="profile-footer">
          <p>NEARME © 2024 • ESTABLISHED FOR CONNECTION</p>
        </footer>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { userApi } from '@/services/api'
import UserAvatar from '@/components/UserAvatar.vue'

const router = useRouter()
const auth = useAuthStore()

const username = ref(auth.user?.username ?? '')
const usernameError = ref('')
const isLoading = ref(false)

function validateUsername() {
  usernameError.value = ''

  if (username.value.length === 0) {
    usernameError.value = ''
    return
  }

  if (username.value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters'
    return
  }

  if (username.value.length > 20) {
    usernameError.value = 'Username must be at most 20 characters'
    return
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username.value)) {
    usernameError.value = 'Username can only contain letters, numbers, and underscores'
    return
  }
}

async function handleSubmit() {
  validateUsername()

  if (usernameError.value) {
    return
  }

  isLoading.value = true
  try {
    const updatedUser = await userApi.completeProfile({
      username: username.value.trim(),
    })
    if (auth.token) auth.setAuth(auth.token, updatedUser)
    await router.push('/permission-request')
  } catch (err: unknown) {
    usernameError.value =
      err instanceof Error ? err.message : 'Failed to set profile. Please try again.'
  } finally {
    isLoading.value = false
  }
}

async function handleSkip() {
  isLoading.value = true
  try {
    const updatedUser = await userApi.completeProfile({})
    if (auth.token) auth.setAuth(auth.token, updatedUser)
    await router.push('/permission-request')
  } catch (err: unknown) {
    usernameError.value =
      err instanceof Error ? err.message : 'Failed to continue. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.select-profile-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #faf9f7;
  font-family: 'Poppins', 'Inter', sans-serif;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 40px;
  font-size: 1.5rem;
  letter-spacing: 0.5px;
}

.profile-header h1 {
  margin: 0;
  color: #2c1d25;
  font-weight: 700;
}

.skip-btn {
  background: none;
  border: none;
  color: #0c9081;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 12px;
  transition: opacity 0.2s;
}

.skip-btn:hover {
  opacity: 0.8;
}

.profile-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 16px 56px;
}

.profile-card {
  width: min(500px, 100%);
  background: #fff;
  border-radius: 24px;
  padding: 48px 40px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
}

.profile-content {
  text-align: center;
}

.profile-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2c1d25;
  margin: 0 0 12px;
}

.profile-subtitle {
  font-size: 0.95rem;
  color: #8c7c86;
  margin: 0 0 32px;
  line-height: 1.5;
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
}

.avatar-placeholder {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: #f0ebe5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c5b5ac;
  border: none;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition:
    transform 0.2s,
    background 0.2s;
  padding: 0;
}

.avatar-placeholder:hover {
  transform: scale(1.05);
  background: #e8dfd7;
}

.avatar-placeholder svg {
  width: 60px;
  height: 60px;
  stroke: currentColor;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.2s;
}

.avatar-placeholder:hover .avatar-overlay {
  background: rgba(0, 0, 0, 0.2);
  opacity: 1;
}

.upload-icon {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 300;
  color: #2c1d25;
}

.form-group {
  text-align: left;
  margin-bottom: 24px;
}

label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8c7c86;
  letter-spacing: 0.8px;
  margin-bottom: 8px;
}

.input-wrapper {
  background: #f5f2ef;
  border: 1px solid #e0dbd5;
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within {
  border-color: #0c9081;
}

.input-wrapper input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.95rem;
  color: #2b1d22;
  font-family: 'Poppins', 'Inter', sans-serif;
}

.input-wrapper input::placeholder {
  color: #b8abb5;
}

.input-wrapper input:focus {
  outline: none;
}

.input-suffix {
  font-size: 0.95rem;
  color: #0c9081;
  font-weight: 600;
}

.error-text {
  font-size: 0.85rem;
  color: #c0392b;
  margin-top: 6px;
  margin-bottom: 0;
}

.pro-tip {
  background: #f8f6f3;
  border: 1px solid #ebe7df;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 28px;
  text-align: left;
}

.pro-tip-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: #5b4a55;
  letter-spacing: 1px;
}

.pro-tip-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #0c9081;
}

.pro-tip-text {
  font-size: 0.9rem;
  color: #6f6473;
  margin: 0;
  line-height: 1.4;
}

.start-btn {
  width: 100%;
  background: linear-gradient(140deg, #c7a038, #6c4f15);
  color: #fff;
  border: none;
  border-radius: 18px;
  padding: 14px 24px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 12px 20px rgba(108, 79, 21, 0.25);
  transition: opacity 0.2s;
  font-family: 'Poppins', 'Inter', sans-serif;
}

.start-btn:hover:not(:disabled) {
  opacity: 0.95;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.profile-footer {
  margin-top: auto;
  text-align: center;
  font-size: 0.75rem;
  color: #b8abb5;
  letter-spacing: 0.5px;
  margin-top: 40px;
}

.profile-footer p {
  margin: 0;
}

@media (max-width: 480px) {
  .profile-header {
    padding: 16px;
  }

  .profile-card {
    padding: 32px 20px;
    border-radius: 16px;
  }

  .profile-title {
    font-size: 1.5rem;
  }

  .profile-subtitle {
    font-size: 0.9rem;
  }

  .avatar-placeholder {
    width: 100px;
    height: 100px;
  }

  .avatar-placeholder svg {
    width: 50px;
    height: 50px;
  }
}
</style>
