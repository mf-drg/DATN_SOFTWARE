import io from 'socket.io-client'
import store from '../store/index'
const baseURL = import.meta.env.VITE_NODE_ENV?.toString() === 'development' ? import.meta.env.VITE_API_URL?.toString() : ''
const socket = io(baseURL)
socket.on('connect', () => {
  store.commit('setSocketState', true)
  store.dispatch('handleNotifications', { message: 'Connected to socket server.', success: true })
  console.log('Socket connected!')
})
socket.on('connect_error', () => {
  if (store.state.socketConnected !== false) {
    store.dispatch('handleNotifications', { message: 'Cannot connect to socket server.' })
    store.commit('setSocketState', false)
  }
})
socket.on('disconnect', () => {
  store.dispatch('handleNotifications', { message: 'Disconnected from socket server.' })
  store.commit('setSocketState', false)
})
export default socket
