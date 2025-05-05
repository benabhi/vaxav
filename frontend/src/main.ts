/**
 * @file Punto de entrada principal de la aplicación
 * @description Configuración de Vue, Pinia, Router y servicios
 * @module main
 */

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import authService from './services/authService'
import { useAuthStore } from './stores/auth'
import { useUserStore, setupUserStoreWatchers } from './stores/user'
import { piniaPersistedState } from './stores/plugins/persistence'

// Crear la aplicación y configurar Pinia con persistencia
const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPersistedState)
app.use(pinia)
app.use(router)

// Función para inicializar la aplicación
const initApp = async () => {
    // Inicializar el token desde localStorage
    const hasToken = authService.initToken()

    // Configurar watchers para el store unificado
    setupUserStoreWatchers()

    // Si hay un token, cargar los datos del usuario usando el store unificado
    if (hasToken) {
        const userStore = useUserStore()
        try {
            await userStore.loadUserData()
            console.log('Datos de usuario cargados correctamente')
        } catch (error) {
            console.error('Error al cargar los datos del usuario:', error)
        }
    }

    // Montar la aplicación
    app.mount('#app')
}

// Iniciar la aplicación
initApp()
