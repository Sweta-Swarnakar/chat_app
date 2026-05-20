const parsePagination = (query = {}) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit, 10) || 20, 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPageResponse = (items, total, page, limit) => ({
  data: items,
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.max(Math.ceil(total / limit), 1)
  }
});

module.exports = {
  parsePagination,
  buildPageResponse
};
