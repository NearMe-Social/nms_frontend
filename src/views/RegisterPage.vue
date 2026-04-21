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
                        <div class="input-wrapper custom-select" ref="genderDropdownRef" :class="{ 'is-open': isGenderOpen }">
                            <button
                                id="gender"
                                type="button"
                                class="select-trigger"
                                :class="{ 'is-placeholder': !gender }"
                                aria-haspopup="listbox"
                                :aria-expanded="isGenderOpen.toString()"
                                @click="toggleGenderDropdown"
                            >
                                <span>{{ selectedGenderLabel }}</span>
                                <span class="select-chevron" :class="{ 'is-open': isGenderOpen }">▾</span>
                            </button>

                            <ul v-if="isGenderOpen" class="select-menu" role="listbox" aria-label="Select your gender">
                                <li v-for="option in genderOptions" :key="option.value" role="option" :aria-selected="(gender === option.value).toString()">
                                    <button
                                        type="button"
                                        class="select-option"
                                        :class="{ 'is-selected': gender === option.value }"
                                        @click="selectGender(option.value)"
                                    >
                                        {{ option.label }}
                                    </button>
                                </li>
                            </ul>
                        </div>
                        <p v-if="genderError" class="field-error">{{ genderError }}</p>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const birthday = ref('')
const gender = ref('')
const contact = ref('')
const password = ref('')
const isGenderOpen = ref(false)
const genderError = ref('')
const genderDropdownRef = ref<HTMLElement | null>(null)

const genderOptions = [
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'non-binary', label: 'Non-binary' },
    { value: 'prefer-not', label: 'Prefer not to say' },
]

const selectedGenderLabel = computed(() => {
    return genderOptions.find((option) => option.value === gender.value)?.label || 'Select your gender'
})

function toggleGenderDropdown() {
    isGenderOpen.value = !isGenderOpen.value
}

function selectGender(value: string) {
    gender.value = value
    genderError.value = ''
    isGenderOpen.value = false
}

function closeGenderDropdownOnOutsideClick(event: MouseEvent) {
    if (!genderDropdownRef.value) {
        return
    }

    const target = event.target as Node
    if (!genderDropdownRef.value.contains(target)) {
        isGenderOpen.value = false
    }
}

onMounted(() => {
    document.addEventListener('pointerdown', closeGenderDropdownOnOutsideClick)
})

onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', closeGenderDropdownOnOutsideClick)
})

function handleRegister() {
    if (!gender.value) {
        genderError.value = 'Please select your gender.'
        isGenderOpen.value = true
        return
    }

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
    display: flex;
    flex-direction: column;
    font-family: 'Poppins', 'Inter', sans-serif;
    padding-inline: 0;
}

.register-header {
    padding: clamp(16px, 3vw, 24px) clamp(20px, 6vw, 56px) 0;
    font-size: 1.5rem;
    letter-spacing: 0.5px;
    color: #1f1720;
}

.register-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: clamp(16px, 3vw, 24px) clamp(14px, 4vw, 24px) clamp(40px, 7vw, 64px);
}

.register-card {
    width: min(560px, 100%);
    padding: clamp(30px, 4vw, 48px) clamp(20px, 6vw, 56px) clamp(26px, 4vw, 40px);
    text-align: left;
    box-sizing: border-box;
}

.card-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    margin-bottom: 6px;
    color: #231c23;
    line-height: 1.2;
}

.card-subtitle {
    font-size: clamp(0.92rem, 2.6vw, 1rem);
    color: #6c6067;
    margin-bottom: clamp(24px, 4vw, 32px);
    line-height: 1.45;
}

.register-form {
    display: flex;
    flex-direction: column;
    gap: clamp(14px, 2.5vw, 20px);
}

.two-column {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: clamp(12px, 2.5vw, 20px);
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
    box-sizing: border-box;
}

.input-wrapper input,
.input-wrapper select {
    width: 100%;
    border: none;
    background: transparent;
    font-size: 1rem;
    color: #3a2f35;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
    outline: none;
}

.custom-select {
    padding: 0;
    position: relative;
    overflow: visible;
}

.custom-select.is-open {
    border-color: #bfa57e;
    box-shadow: 0 0 0 3px rgba(191, 165, 126, 0.18);
}

.select-trigger {
    width: 100%;
    border: none;
    background: transparent;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    font-size: 1rem;
    color: #2f232a;
    text-align: left;
    cursor: pointer;
}

.select-trigger.is-placeholder {
    color: #7d6f78;
}

.select-trigger:focus-visible {
    outline: none;
}

.select-chevron {
    color: #8f7e86;
    font-size: 0.88rem;
    transition: transform 0.16s ease;
}

.select-chevron.is-open {
    transform: rotate(180deg);
}

.select-menu {
    list-style: none;
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    margin: 0;
    padding: 6px;
    background: #fff;
    border: 1px solid #d8cfc6;
    border-radius: 14px;
    box-shadow: 0 14px 26px rgba(53, 35, 15, 0.2);
    max-height: 220px;
    overflow-y: auto;
    z-index: 20;
}

.select-option {
    width: 100%;
    border: none;
    border-radius: 10px;
    padding: 10px 12px;
    background: transparent;
    color: #3a2f35;
    font-size: 0.96rem;
    text-align: left;
    cursor: pointer;
}

.select-option:hover,
.select-option:focus-visible {
    background: #f4eee8;
    outline: none;
}

.select-option.is-selected {
    background: #efe5d8;
    color: #5a4315;
    font-weight: 600;
}

.field-error {
    margin-top: 6px;
    font-size: 0.78rem;
    color: #b33a3a;
}

.register-btn {
    margin-top: 6px;
    width: 100%;
    border: none;
    border-radius: 18px;
    padding: 14px 16px;
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
    margin-top: clamp(24px, 4vw, 32px);
    font-size: 0.8rem;
    text-align: center;
    color: #8b7c83;
    line-height: 1.5;
}

.cookie-text a {
    color: #0c9081;
    font-weight: 500;
}

@media (max-width: 768px) {
    .register-main {
        align-items: flex-start;
    }

    .register-card {
        max-width: 640px;
    }
}

@media (max-width: 640px) {
    .register-card {
        padding: 34px 22px 28px;
        border-radius: 24px;
    }

    .register-header {
        padding: 16px;
    }

    .register-form {
        gap: 14px;
    }

    .input-wrapper {
        height: 46px;
        padding: 0 14px;
        border-radius: 14px;
        display: flex;
        align-items: center;
    }

    .select-trigger {
        height: 100%;
        padding: 0;
    }

    .select-menu {
        border-radius: 12px;
    }

    .two-column {
        gap: 10px;
    }
}

@media (max-width: 380px) {
    .register-header {
        font-size: 1.28rem;
    }

    .register-card {
        padding: 28px 16px 24px;
    }

    .card-title {
        font-size: 1.35rem;
    }

    .form-group label {
        font-size: 0.74rem;
        letter-spacing: 0.5px;
    }

    .register-btn,
    .ghost-link {
        font-size: 0.92rem;
    }
}
</style>