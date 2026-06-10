<template>
  <div class="permission-page">
    <Navbar />

    <div class="permission-container">
      <section class="permission-card">
        <!-- Icon/Illustration -->
        <div class="icon-wrapper">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="permission-icon"
          >
            <!-- Location pin with signal waves -->
            <circle cx="32" cy="32" r="2" fill="#0c9081" />
            <circle cx="32" cy="32" r="8" fill="none" stroke="#0c9081" stroke-width="0.5" opacity="0.6" />
            <circle cx="32" cy="32" r="14" fill="none" stroke="#0c9081" stroke-width="0.5" opacity="0.3" />

            <!-- Pin shape -->
            <path
              d="M32 8C22.06 8 14 16.06 14 26c0 10 18 32 18 32s18-22 18-32c0-9.94-8.06-18-18-18z"
              fill="none"
              stroke="#0c9081"
              stroke-width="1.5"
              stroke-linejoin="round"
            />
            <circle cx="32" cy="26" r="3" fill="#0c9081" />
          </svg>
        </div>

        <!-- Title and Description -->
        <h1 class="permission-title">Enable Geolocation</h1>
        <p class="permission-subtitle">
          To discover nearby connections and content, we need access to your location.
        </p>

        <!-- Permission Features -->
        <ul class="permission-features">
          <li>
            <span class="feature-icon">✓</span>
            <span>Find people and discussions near you</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>See relevant local content</span>
          </li>
          <li>
            <span class="feature-icon">✓</span>
            <span>Connect with your community</span>
          </li>
        </ul>

        <!-- Primary State: Idle -->
        <div v-if="status === 'idle'" class="state-container">
          <button @click="requestPermission" class="permission-btn primary">
            <MapPin class="btn-icon" />
            Enable Location Access
          </button>
          <p class="privacy-note">
            Your location is only used to find nearby content and people. <a href="/privacy">Learn more</a>
          </p>
        </div>

        <!-- Requesting State -->
        <div v-else-if="status === 'requesting'" class="state-container">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p class="status-text">Requesting location access...</p>
        </div>

        <!-- Granted State -->
        <div v-else-if="status === 'granted'" class="state-container success">
          <div class="success-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                fill="#10b981"
              />
            </svg>
          </div>
          <p class="status-text success-text">Location access granted!</p>
          <button @click="continueToApp" class="permission-btn primary">
            Continue to App
          </button>
        </div>

        <!-- Denied State -->
        <div v-else-if="status === 'denied'" class="state-container error">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                fill="#ef4444"
              />
            </svg>
          </div>
          <p class="status-text error-text">Location access was denied</p>
          <p class="error-details">
            To enable location access, please update your browser settings or try a different browser.
          </p>
          <button @click="requestPermission" class="permission-btn secondary">
            Try Again
          </button>
        </div>

        <!-- Unavailable State -->
        <div v-else-if="status === 'unavailable'" class="state-container error">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                fill="#ef4444"
              />
            </svg>
          </div>
          <p class="status-text error-text">Geolocation unavailable</p>
          <p class="error-details">
            {{ errorMessage || 'Your device does not support geolocation or it is turned off.' }}
          </p>
          <button @click="continueToApp" class="permission-btn secondary">
            Continue Without Location
          </button>
        </div>

        <!-- Error State -->
        <div v-else-if="status === 'error'" class="state-container error">
          <div class="error-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"
                fill="#ef4444"
              />
            </svg>
          </div>
          <p class="status-text error-text">Something went wrong</p>
          <p class="error-details">
            {{ errorMessage || 'An error occurred while requesting location. Please try again.' }}
          </p>
          <button @click="requestPermission" class="permission-btn secondary">
            Try Again
          </button>
        </div>
      </section>

      <!-- Skip Option -->
      <div v-if="status !== 'requesting' && status !== 'granted'" class="skip-container">
        <button @click="continueToApp" class="skip-btn">Skip for now</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGeolocation } from '@/composables/useGeolocation'
import { MapPin } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'

const router = useRouter()
const { status, errorMessage, request } = useGeolocation()

async function requestPermission() {
  await request()
}

function continueToApp() {
  router.push('/')
}
</script>

<style scoped>
.permission-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f4f7fb 0%, #e8f5f3 100%);
  font-family: 'Poppins', 'Inter', sans-serif;
}

.permission-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: clamp(20px, 5vw, 40px);
  gap: clamp(20px, 4vw, 32px);
}

.permission-card {
  width: min(480px, 100%);
  padding: clamp(40px, 6vw, 56px) clamp(24px, 5vw, 40px);
  background: white;
  border-radius: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.icon-wrapper {
  margin-bottom: clamp(24px, 4vw, 32px);
  display: flex;
  justify-content: center;
}

.permission-icon {
  width: clamp(80px, 15vw, 120px);
  height: clamp(80px, 15vw, 120px);
  color: #0c9081;
}

.permission-title {
  font-size: clamp(1.5rem, 4vw, 1.875rem);
  font-weight: 700;
  color: #1f1720;
  margin: 0 0 12px;
  line-height: 1.2;
}

.permission-subtitle {
  font-size: clamp(0.95rem, 2vw, 1rem);
  color: #6c6067;
  margin: 0 0 clamp(24px, 4vw, 32px);
  line-height: 1.5;
}

.permission-features {
  list-style: none;
  margin: 0 0 clamp(32px, 5vw, 40px);
  padding: 0;
  text-align: left;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.permission-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.95rem;
  color: #3a2f35;
}

.feature-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #d1f4f1;
  color: #0c9081;
  font-weight: 700;
  font-size: 0.875rem;
}

.state-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
}

.permission-btn {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 18px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.permission-btn.primary {
  background: linear-gradient(145deg, #0c9081, #087268);
  color: white;
  box-shadow: 0 8px 16px rgba(12, 144, 129, 0.3);
}

.permission-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(12, 144, 129, 0.4);
}

.permission-btn.primary:active {
  transform: translateY(0);
}

.permission-btn.secondary {
  background: #f0f0f0;
  color: #3a2f35;
  border: 1px solid #e0d6cd;
}

.permission-btn.secondary:hover {
  background: #e8e8e8;
}

.btn-icon {
  width: 18px;
  height: 18px;
}

.loading-spinner {
  display: flex;
  justify-content: center;
  margin: 16px 0;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e0d6cd;
  border-top-color: #0c9081;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.status-text {
  font-size: 0.95rem;
  color: #6c6067;
  margin: 8px 0;
}

.status-text.success-text {
  color: #10b981;
  font-weight: 600;
}

.status-text.error-text {
  color: #ef4444;
  font-weight: 600;
}

.success-icon,
.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  margin: 0 auto;
}

.success-icon {
  background: #d1fae5;
}

.success-icon svg {
  width: 28px;
  height: 28px;
}

.error-icon {
  background: #fee2e2;
}

.error-icon svg {
  width: 28px;
  height: 28px;
}

.error-details {
  font-size: 0.85rem;
  color: #6c6067;
  margin: 0;
  line-height: 1.5;
}

.privacy-note {
  font-size: 0.8rem;
  color: #8b7c83;
  margin: 0;
  line-height: 1.4;
}

.privacy-note a {
  color: #0c9081;
  text-decoration: none;
  font-weight: 500;
}

.privacy-note a:hover {
  text-decoration: underline;
}

.skip-container {
  text-align: center;
}

.skip-btn {
  background: none;
  border: none;
  color: #6c6067;
  font-size: 0.95rem;
  cursor: pointer;
  text-decoration: underline;
  transition: color 0.2s ease;
}

.skip-btn:hover {
  color: #3a2f35;
}

@media (max-width: 640px) {
  .permission-card {
    padding: 32px 20px;
    border-radius: 20px;
  }

  .permission-title {
    font-size: 1.375rem;
  }

  .permission-features {
    text-align: left;
    margin-bottom: 28px;
  }

  .permission-btn {
    padding: 12px 14px;
    font-size: 0.9rem;
    border-radius: 16px;
  }
}

@media (max-width: 380px) {
  .permission-page {
    padding: 16px;
  }

  .permission-card {
    padding: 28px 16px;
  }

  .permission-title {
    font-size: 1.25rem;
  }

  .permission-subtitle {
    font-size: 0.9rem;
  }

  .permission-btn {
    font-size: 0.85rem;
    padding: 11px 12px;
  }
}
</style>
