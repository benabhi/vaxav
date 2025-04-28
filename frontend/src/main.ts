import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import authService from './services/authService'
import { useAuthStore } from './stores/auth'

// Crear la aplicación y el store
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

// Función para inicializar la aplicación
const initApp = async () => {
    // Inicializar el token desde localStorage
    const hasToken = authService.initToken()

    // Si hay un token, intentar cargar el usuario
    if (hasToken) {
        const authStore = useAuthStore()
        try {
            await authStore.fetchUser()
            console.log('Usuario cargado:', authStore.user)
        } catch (error) {
            console.error('Error al cargar el usuario:', error)
        }
    }

    // Montar la aplicación
    app.mount('#app')
}

// Iniciar la aplicación
initApp()
