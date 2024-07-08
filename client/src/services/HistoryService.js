export default {
  async search(store, axios, query) {
    const qr = []
    qr.push(`page=${store.state.page}&limit=${store.state.limit}`)
    if (query.fromDate && query.toDate) {
      qr.push(`fromDate=${query.fromDate}`)
      qr.push(`toDate=${query.toDate}`)
    }
    if (query.sort) {
      qr.push(`sort=${query.sort}`)
    }
    const res = await axios.get(`/api/v1/admin/history/search${qr.length > 0 ? `?${qr.join('&')}` : ''}`)
    return res.data
  },
  async download(store, axios, query) {
    const qr = []
    qr.push(`page=${store.state.page}&limit=${store.state.limit}`)
    if (query.fromDate && query.toDate) {
      qr.push(`fromDate=${query.fromDate}`)
      qr.push(`toDate=${query.toDate}`)
    }
    const res = await axios.get(`/api/v1/admin/history/download${qr.length > 0 ? `?${qr.join('&')}` : ''}`)
    return res.data
  },
}
