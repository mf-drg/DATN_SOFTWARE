import { computed } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { useStore } from 'vuex'
import jwtDecode from 'jwt-decode'
import { useCookies } from 'vue3-cookies'
import Dashboard from './views/Dashboard.vue'
import Device from './views/Device.vue'
import User from './views/User.vue'
import Setting from './views/Setting.vue'
import NotFound from './views/NotFound.vue'
import LogIn from './views/LogIn.vue'
import authService from './services/AuthService.js'
import axios from './plugins/axios'
import { EUserRole } from './enums/index.js'

const { cookies } = useCookies()

const routes = [
  {
    path: '/',
    name: 'Root',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn,
    meta: { layout: 'empty' },
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { authRequire: true },
  },
  {
    path: '/devices',
    name: 'Device',
    component: Device,
    meta: { authRequire: true },
  },
  {
    path: '/users',
    name: 'User',
    component: User,
    meta: { authRequire: true, rolesRequire: [EUserRole.ROOT] },
  },
  {
    path: '/setting',
    name: 'Setting',
    component: Setting,
    meta: { authRequire: true },
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound, meta: { layout: 'empty' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

router.beforeEach(async (to, from, next) => {
  const store = useStore()
  const localToken = cookies.get('token')
  const authenticated = store.state.authenticated
  const loginUser = computed(() => store.state.user)
  try {
    if (to.meta.authRequire) {
      if (!authenticated && localToken) {
        const tokenDecode = jwtDecode(localToken)
        if (tokenDecode && tokenDecode.exp && tokenDecode.exp > Date.now() / 1000) {
          axios.defaults.headers['Authorization'] = `Bearer ${localToken}`
          await authService.getMe(axios, tokenDecode.id)
          delete tokenDecode.exp
          delete tokenDecode.iat
          store.commit('setAuth', true)
          store.commit('setUser', tokenDecode)
          store.dispatch('fetchAccessToken')
          store.dispatch('connectMqtt')
        } else {
          cookies.remove('token')
          cookies.remove('mqttToken')
          store.dispatch('disconectMqtt')
          next({ name: 'LogIn' })
        }
      }
      const rolesRequire = to.meta?.rolesRequire || []
      if (!authenticated && !localToken) {
        next({ name: 'LogIn' })
      } else if (rolesRequire.length > 0 && !rolesRequire.includes(loginUser.value.role)) {
        next({
          name: 'NotFound',
        })
      } else {
        next()
      }
    } else {
      const matched = to.matched.some((record) => record.path === '/login')
      if ((matched && authenticated) || (matched && localToken)) {
        next({ name: 'Root' })
      } else next()
    }
  } catch (err) {
    next({
      name: 'LogIn',
    })
  }
})

export default router
