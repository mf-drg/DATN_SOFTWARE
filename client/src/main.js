import { createApp } from 'vue'
import './assets/main.css'
import Toast from 'vue-toastification'
import PrimeVue from 'primevue/config'
import 'vue-toastification/dist/index.css'
import App from './App.vue'
import router from './router'
import Aura from './presets/aura/index.js'
import store from './store/index'
import axios from './plugins/axios'
import global from './plugins/global'
import DashboardLayout from './layouts/DashboardLayout.vue'
import EmptyLayout from './layouts/EmptyLayout.vue'
import mqtt from './plugins/mqtt.js'
const app = createApp(App)
app.use(router)
app.config.globalProperties.$axios = axios
app.provide('axios', axios)
app.use(mqtt)
app.use(store)
app.use(Toast)
app.use(global)
app.use(PrimeVue, {
  unstyled: true,
  pt: Aura,
})
app.component('default-layout', DashboardLayout)
app.component('empty-layout', EmptyLayout)
app.mount('#app')
