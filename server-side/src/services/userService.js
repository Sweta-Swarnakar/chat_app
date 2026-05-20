const User = require("../models/User");
const ApiError = require("../errors/ApiError");
const { parsePagination, buildPageResponse } = require("../utils/pagination");

const buildUserProjection = "name email avatarUrl isOnline createdAt updatedAt";

const listUsers = async ({ currentUserId, search = "", page, limit }) => {
  const { page: safePage, limit: safeLimit, skip } = parsePagination({ page, limit });
  const query = {
    _id: { $ne: currentUserId }
  };

  if (search && search.trim()) {
    const regex = new RegExp(search.trim(), "i");
    query.$or = [{ name: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(query).select(buildUserProjection).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    User.countDocuments(query)
  ]);

  return buildPageResponse(users, total, safePage, safeLimit);
};

const getMe = async (currentUserId) => {
  const user = await User.findById(currentUserId).select(buildUserProjection);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const getUserById = async (userId) => {
  const user = await User.findById(userId).select(buildUserProjection);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateMe = async (currentUserId, { name, avatarUrl }) => {
  const user = await User.findById(currentUserId);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (typeof name === "string" && name.trim()) {
    user.name = name.trim();
  }

  if (typeof avatarUrl === "string") {
    user.avatarUrl = avatarUrl.trim();
  }

  await user.save();

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl || "",
    isOnline: user.isOnline,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
};

module.exports = {
  listUsers,
  getMe,
  getUserById,
  updateMe
};
