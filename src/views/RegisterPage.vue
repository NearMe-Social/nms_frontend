<template>
    <div class="register-page">
        <header class="register-header">
            <h1>Nearme</h1>
        </header>

        <main class="register-main">
            <section class="register-card">
                <h1 class="card-title">Create your connection</h1>
                <p class="card-subtitle">Create your account and discover vibrant local connections near you.</p>

                <form class="register-form" @submit.prevent="handleRegister">
                    <div class="two-column">
                        <div class="form-group">
                            <label for="first-name">First name</label>
                            <div class="input-wrapper">
                                <input id="first-name" type="text" placeholder="e.g. Julian" v-model="firstName" required />
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="last-name">Last name</label>
                            <div class="input-wrapper">
                                <input id="last-name" type="text" placeholder="e.g. Thorne" v-model="lastName" required />
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="birthday">Birthday</label>
                        <div class="input-wrapper">
                            <input id="birthday" type="text" placeholder="MM/DD/YYYY" v-model="birthday" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="gender">Select your gender</label>
                        <div class="input-wrapper select-wrapper">
                            <select id="gender" v-model="gender" required>
                                <option value="" disabled>Select your gender</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="non-binary">Non-binary</option>
                                <option value="prefer-not">Prefer not to say</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="contact">Mobile number or email</label>
                        <div class="input-wrapper">
                            <input id="contact" type="text" placeholder="phone@example.com" v-model="contact" required />
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="password">Password</label>
                        <div class="input-wrapper">
                            <input id="password" type="password" placeholder="********" v-model="password" required />
                        </div>
                    </div>

                    <button type="submit" class="register-btn">Register Now</button>
                    <button type="button" class="ghost-link" @click="goToLogin">I already have an account</button>
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

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const birthday = ref('')
const gender = ref('')
const contact = ref('')
const password = ref('')

function handleRegister() {
    console.log('register', {
        firstName: firstName.value,
        lastName: lastName.value,
        birthday: birthday.value,
        gender: gender.value,
        contact: contact.value,
    })
}

function goToLogin() {
    router.push('/login')
}
</script>

<style scoped>
.register-page {
    min-height: 100vh;
    background: radial-gradient(circle at top, #f9f7f4 60%, #ebe4dd 100%);
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', 'Inter', sans-serif;
}

.register-header {
    padding: 20px 48px 0;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
    color: #1f1720;
}

.register-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 16px 60px;
}

.register-card {
    width: min(560px, 100%);
    background: #fff;
    border-radius: 28px;
    padding: 48px 56px 40px;
    box-shadow: 0 35px 65px rgba(81, 61, 52, 0.18);
    text-align: left;
}

.card-title {
    font-size: 2rem;
    margin-bottom: 6px;
    color: #231c23;
}

.card-subtitle {
    font-size: 1rem;
    color: #6c6067;
    margin-bottom: 32px;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.two-column {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 20px;
}

.form-group label {
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #887b83;
    margin-bottom: 8px;
    display: block;
}

.input-wrapper {
    border: 1px solid #e0d6cd;
    border-radius: 16px;
    background: #f7f4f0;
    padding: 12px 16px;
}

.input-wrapper input,
.input-wrapper select {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 0.95rem;
    color: #3a2f35;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
    outline: none;
}

.select-wrapper {
    padding-right: 40px;
    position: relative;
}

.select-wrapper::after {
    content: '▾';
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
    color: #9b8e95;
    pointer-events: none;
    font-size: 0.9rem;
}

.register-btn {
    margin-top: 8px;
    width: 100%;
    border: none;
    border-radius: 18px;
    padding: 16px;
    cursor: pointer;
    font-weight: 600;
    font-size: 1rem;
    color: #fff;
    background: linear-gradient(145deg, #caa333, #6f5214);
    box-shadow: 0 15px 25px rgba(110, 83, 20, 0.25);
}

.ghost-link {
    margin-top: 6px;
    border: none;
    background: none;
    color: #0c9081;
    font-weight: 600;
    cursor: pointer;
    font-size: 0.95rem;
}

.cookie-text {
    margin-top: 32px;
    font-size: 0.8rem;
    text-align: center;
    color: #8b7c83;
}

.cookie-text a {
    color: #0c9081;
    font-weight: 500;
}

@media (max-width: 640px) {
    .register-card {
        padding: 36px 24px 32px;
        border-radius: 24px;
    }

    .register-header {
        padding: 20px;
        text-align: center;
    }

    .two-column {
        grid-template-columns: 1fr;
    }
}
</style>