import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import 'bootstrap-icons/font/bootstrap-icons.css'

export const pinia = createPinia()   
import './assets/main.css'

const app = createApp(App)

app.use(pinia)   
app.use(router)

app.mount('#app')