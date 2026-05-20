const asyncHandler = require("../utils/asyncHandler");
const { listUsers, getMe, updateMe, getUserById } = require("../services/userService");

const getUsers = asyncHandler(async (req, res) => {
  const result = await listUsers({
    currentUserId: req.user.id,
    search: req.query.search || "",
    page: req.query.page,
    limit: req.query.limit
  });
  res.json(result);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  const result = await getMe(req.user.id);
  res.json(result);
});

const getSingleUser = asyncHandler(async (req, res) => {
  const result = await getUserById(req.params.userId);
  res.json(result);
});

const updateCurrentUser = asyncHandler(async (req, res) => {
  const result = await updateMe(req.user.id, req.body);
  res.json(result);
});

module.exports = {
  getUsers,
  getMe: getCurrentUser,
  updateMe: updateCurrentUser,
  getUserById: getSingleUser
};
