import mqtt from 'mqtt'

let url = window.location.host
if (import.meta.env.VITE_NODE_ENV?.toString() === 'development') {
  url = import.meta.env.VITE_MQTT_URL?.toString()
}
export const mqttClient = mqtt.connect('ws://' + url + ':8083', {
  clean: true,
  path: '/mqtt',
  clientId: '',
  username: '',
  protocolVersion: 5,
  manualConnect: true,
  password: '',
})

export default {
  install(app) {
    app.provide('mqttClient', mqttClient)
  },
}
