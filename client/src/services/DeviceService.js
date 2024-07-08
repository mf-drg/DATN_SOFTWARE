import queryString from 'query-string'

export async function getDevice(axios, id) {
  const res = await axios.get(`/api/v1/device/${id}`)
  return res.data
}
export async function searchDevice(axios, query) {
  const queries = queryString.stringify(query)
  const res = await axios.get(`/api/v1/device?${queries}`)
  return res.data
}
export async function editDevice(axios, id, data) {
  const res = await axios.put(`/api/v1/device/${id}`, data)
  return res.data
}
export async function addDevice(axios, data) {
  const res = await axios.post(`/api/v1/device`, data)
  return res.data
}
export async function getDevicePermission(axios, id) {
  const res = await axios.get(`/api/v1/device/${id}/permission`)
  return res.data
}
export async function saveManySchedule(axios, id, data) {
  const res = await axios.post(`/api/v1/device/${id}/schedule`, data)
  return res.data
}
export async function deleteOneSchedule(axios, id, scheduleId) {
  const res = await axios.delete(`/api/v1/device/${id}/schedule/${scheduleId}`)
  return res.data
}
export async function changeDeviceProperty(axios, id, data) {
  const res = await axios.put(`/api/v1/device/${id}/set`, data)
  return res.data
}
export async function deleteDevice(axios, id) {
  const res = await axios.delete(`/api/v1/device/${id}`)
  return res.data
}
