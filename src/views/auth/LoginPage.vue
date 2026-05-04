<template>
    <div class="login-page">
        <header class="login-header">
            <h1>Nearme</h1>
        </header>

        <main class="login-main">
            <section class="login-card">
                <h1 class="card-title">Welcome back to Nearme Social</h1>
                <h2 class="card-section-title">Log In</h2>
                <p class="card-subtitle">Enter your detail to access your account</p>

                <form class="login-form" @submit.prevent="handleLogin">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <div class="input-wrapper">
                            <input type="email" id="email" placeholder="Enter your email" v-model="email" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <input type="password" id="password" placeholder="Enter your password" v-model="password" required />
                        </div>
                    </div>

                    <div class="form-support">
                        <a href="/forgot-password">Forgot Password?</a>
                    </div>

                    <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>

                    <button type="submit" class="login-btn" :disabled="isLoading">
                        {{ isLoading ? 'Logging in...' : 'Log In' }}
                    </button>

                    <p class="signup-text">Don't have account? <a href="/register">Register</a></p>

                    <div class="divider">
                        <span>OR CONTINUE WITH</span>
                    </div>

                    <div class="btn-social">
                        <button type="button" class="btn-social__item btn-social--google" @click="handleSocialLogin('google')">
                            <img :src="googleIcon" alt="Google" class="btn-icon" />
                        </button>

                        <button type="button" class="btn-social__item btn-social--facebook" @click="handleSocialLogin('facebook')">
                            <img :src="facebookIcon" alt="Facebook" class="btn-icon" />
                        </button>

                        <button type="button" class="btn-social__item btn-social--x" @click="handleSocialLogin('x')">
                            <img :src="xIcon" alt="X" class="btn-icon" />
                        </button>
                    </div>
                </form>

                <p class="cookie-text">
                    By clicking Register Now, you agree to our <a href="/terms">Terms, Privacy Policy</a> and <a href="/cookies">Cookies
                    Policy.</a>
                </p>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authApi } from '@/services/api'

import googleIcon from '@/assets/icons/Google.png'
import facebookIcon from '@/assets/icons/Facebook.png'
import xIcon from '@/assets/icons/X.png'

const router = useRouter()
const auth = useAuthStore()

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const isLoading = ref(false)

async function handleLogin() {
    errorMsg.value = ''
    isLoading.value = true
    try {
        const res = await authApi.login(email.value, password.value)
        auth.setAuth(res.token, res.user)
        const redirect = router.currentRoute.value.query.redirect
        router.replace(typeof redirect === 'string' ? redirect : '/')
    } catch (err: unknown) {
        errorMsg.value = err instanceof Error ? err.message : 'Login failed. Please try again.'
    } finally {
        isLoading.value = false
    }
}

function handleSocialLogin(provider: string) {
    console.log('social login', provider)
}
</script>

<style scoped>
.login-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', 'Inter', sans-serif;
}

.login-header {
    padding: 18px 40px;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
}

.login-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 16px 56px;
}

.login-card {
    width: min(380px, 100%);
    padding: 36px 32px 40px;
    text-align: left;
}

.card-title {
    font-size: 1.5rem;
    margin-bottom: 4px;
    color: #2c1d25;
}

.card-section-title {
    font-size: 1.1rem;
    margin-bottom: 4px;
    color: #2c1d25;
}

.card-subtitle {
    font-size: 0.95rem;
    color: #6f6473;
    margin-bottom: 24px;
}

.login-form {
    display: flex;
    flex-direction: column;
}

.form-group + .form-group {
    margin-top: 18px;
}

label {
    font-weight: 600;
    font-size: 0.9rem;
    color: #4a3b44;
    display: block;
    margin-bottom: 6px;
}

.input-wrapper {
    background: #f5f2ef;
    border: 1px solid #d6d1ca;
    border-radius: 14px;
    padding: 10px 14px;
    display: flex;
    align-items: center;
}

.input-wrapper input {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: #2b1d22;
}

.input-wrapper input:focus {
    outline: none;
}

.form-support {
    display: flex;
    justify-content: flex-end;
    margin-top: 8px;
}

.form-support a {
    font-size: 0.85rem;
    color: #0c9081;
}

.error-msg {
    margin-top: 10px;
    font-size: 0.88rem;
    color: #c0392b;
    background: #fdf0ef;
    border: 1px solid #f5c6c2;
    border-radius: 10px;
    padding: 8px 12px;
    text-align: center;
}

.login-btn {
    margin-top: 24px;
    width: 100%;
    border: none;
    border-radius: 18px;
    padding: 14px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    color: #fff;
    background: linear-gradient(140deg, #c7a038, #6c4f15);
    box-shadow: 0 12px 20px rgba(108, 79, 21, 0.25);
    transition: opacity 0.2s;
}

.login-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.signup-text {
    margin-top: 18px;
    text-align: center;
    font-size: 0.9rem;
    color: #5b4a55;
}

.signup-text a {
    color: #0c9081;
    font-weight: 600;
}

.divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
    font-size: 0.75rem;
    color: #9a8d96;
    letter-spacing: 1.8px;
}

.divider::before,
.divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e7e1da;
}

.btn-social { 
    display:flex; 
    gap:12px; 
    margin-top:12px;
    justify-content: center;
}
.btn-social__item { 
    display:inline-flex; 
    align-items:center; 
    justify-content:center; 
    gap:8px; 
    width:40px; 
    height:40px; 
    padding:0; 
    border-radius:50%; 
    font-weight:600; 
    border: none; 
    cursor: pointer; 
}
.btn-icon { 
    width:50px; 
    height:50px; 
    object-fit:contain 
}
.btn-social--google { 
    background:#fff; 
    color:#000; 
    border:1px solid #ddd; 
}
.btn-social--facebook { 
    background:#1877F2; 
    color:#fff; 
}
.btn-social--x { 
    background:#000; 
    color:#fff; 
}

.cookie-text {
    margin-top: 28px;
    font-size: 0.75rem;
    text-align: center;
    color: #8c7c86;
    line-height: 1.4;
}

.cookie-text a {
    color: #0c9081;
    font-weight: 500;
}

@media (max-width: 480px) {
    .login-card {
        padding: 28px 20px 32px;
    }

    .login-header {
        padding: 16px;
    }
}
</style>
