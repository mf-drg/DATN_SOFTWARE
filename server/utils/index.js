export function generateResponseMeta(totalItems, page, limit) {
  const totalPages = Math.ceil(totalItems / limit)
  const nextPage = page + 1 > totalPages ? null : page + 1
  const prevPage = page - 1 < 1 ? null : page - 1
  return {
    limit,
    page,
    prevPage,
    nextPage,
    totalItems,
    totalPages,
  }
}
