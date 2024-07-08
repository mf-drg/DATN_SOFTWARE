import axios from 'axios'
import { useCookies } from 'vue3-cookies'
import store from '../store/index'
import router from '../router'
const { cookies } = useCookies()

if (import.meta.env.VITE_NODE_ENV?.toString() === 'development') {
  axios.defaults.baseURL = import.meta.env.VITE_API_URL?.toString()
}

const axiosInstance = axios.create()
axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response.status == 401) {
      store.commit('setAuth', false)
      store.commit('setUser', null)
      cookies.remove('token')
      router.push({ name: 'LogIn' })
    }
    return Promise.reject(error)
  }
)

export default axiosInstance
