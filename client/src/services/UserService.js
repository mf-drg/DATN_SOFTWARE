import queryString from 'query-string'
export async function getUser(axios, id) {
  const res = await axios.get(`/api/v1/admin/user/${id}`)
  return res.data
}
export async function searchUser(axios, query) {
  const queries = queryString.stringify(query)
  const res = await axios.get(`/api/v1/admin/user?${queries}`)
  return res.data
}
export async function editUser(axios, id, data) {
  const res = await axios.put(`/api/v1/admin/user/${id}`, data)
  return res.data
}
export async function addUser(axios, data) {
  const res = await axios.post(`/api/v1/admin/user`, data)
  return res.data
}
export async function getUserPermission(axios, id) {
  const res = await axios.get(`/api/v1/admin/user/${id}/permission`)
  return res.data
}
export async function setUserPermission(axios, id, data) {
  const res = await axios.put(`/api/v1/admin/user/${id}/permission`, data)
  return res.data
}
export async function deleteUserPermission(axios, id, deviceId) {
  const res = await axios.delete(`/api/v1/admin/user/${id}/permission/${deviceId}`)
  return res.data
}
