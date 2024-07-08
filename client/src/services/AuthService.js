export default {
  async login(axios, acount) {
    const res = await axios.post('/api/v1/auth/login', acount)
    return res.data
  },
  async signUp(axios, acount) {
    const res = await axios.post('/api/v1/auth/signup', acount)
    return res.data
  },
  async getMe(axios, id) {
    const res = await axios.get('/api/v1/auth/me/' + id)
    return res.data
  },
}
