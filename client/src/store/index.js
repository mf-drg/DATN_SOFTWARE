import { createStore } from 'vuex'
import { useCookies } from 'vue3-cookies'
import { useToast } from 'vue-toastification'
import axios from '../plugins/axios'
import { mqttClient } from '../plugins/mqtt.js'

const { cookies } = useCookies()
const toast = useToast()
export default createStore({
  state: {
    isOpenSidebar: false,
    isLoading: false,
    notification: null,
    page: 1,
    limit: 5,
    isMqttClientConnectOnce: false,
    token: null,
    mqttToken: null,
    authenticated: false,
    user: null,
    setting: null,
    toast: toast,
  },
  mutations: {
    setSidebar: (state, isOpenSidebar) => (state.isOpenSidebar = isOpenSidebar),
    setLoading: (state, isLoading) => (state.isLoading = isLoading),
    setPage: (state, page) => (state.page = page),
    setLimit: (state, limit) => (state.limit = limit),
    setNotification: (state, notification) => (state.notification = notification),
    setSocketState: (state, socketConnected) => (state.socketConnected = socketConnected),
    setUser: (state, user) => (state.user = user),
    setAuth: (state, status) => (state.authenticated = status),
    setToken: (state, { token, mqttToken }) => {
      state.token = token
      state.mqttToken = mqttToken
    },
    setSetting: (state, setting) => (state.setting = setting),
    setIsMqttClientConnectOnce: (state, isMqttClientConnectOnce) => (state.isMqttClientConnectOnce = isMqttClientConnectOnce),
  },
  actions: {
    setSetting({ commit }, st) {
      commit('setSetting', st)
    },
    openSidebar({ commit }) {
      commit('setSidebar', true)
    },
    closeSidebar({ commit }) {
      commit('setSidebar', false)
    },
    startLoading({ commit }) {
      commit('setLoading', true)
    },
    stopLoading({ commit }) {
      commit('setLoading', false)
    },
    connectMqtt({ dispatch, commit, state }) {
      dispatch('disconectMqtt')
      mqttClient.options.clientId = state.user.id + Date.now()
      mqttClient.options.username = state.user.id
      mqttClient.options.password = state.mqttToken
      if (!state.isMqttClientConnectOnce) {
        commit('setIsMqttClientConnectOnce', true)
      }
      if (!state.isMqttClientConnectOnce) {
        mqttClient.connect()
      } else {
        mqttClient.reconnect()
      }
    },
    disconectMqtt() {
      if (mqttClient.connected) {
        mqttClient.end(true, () => {
          mqttClient.options.clientId = ''
          mqttClient.options.username = ''
          mqttClient.options.password = ''
        })
      }
    },
    login({ dispatch, commit }, res) {
      if (res.success) {
        const { token, mqttToken } = res.data
        axios.defaults.headers['Authorization'] = `Bearer ${token}`
        commit('setAuth', true)
        commit('setToken', { token, mqttToken })
        commit('setUser', res.data.user)
        cookies.set('token', token)
        cookies.set('mqttToken', mqttToken)
        dispatch('connectMqtt')
      } else {
        commit('setAuth', false)
        dispatch('disconectMqtt')
      }
    },
    logout({ dispatch, commit }) {
      commit('setAuth', false)
      commit('setUser', null)
      commit('setToken', {})
      cookies.remove('token')
      cookies.remove('mqttToken')
      dispatch('disconectMqtt')
    },
    fetchAccessToken({ commit }) {
      const token = cookies.get('token')
      const mqttToken = cookies.get('mqttToken')
      commit('setToken', { token, mqttToken })
    },
    handleNotifications({ commit }, data) {
      let notification = ''
      if (typeof data.message === 'string') {
        notification = data.message
      }
      commit('setNotification', { text: notification, type: data.success ? 'success' : 'error' })
    },
  },
  modules: {},
})
