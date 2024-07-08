export default {
  async getSetting(axios) {
    const res = await axios.get(`/api/v1/admin/setting`)
    return res.data
  },
  async updateSetting(axios, data) {
    const res = await axios.put(`/api/v1/admin/setting`, data)
    return res.data
  },
}
