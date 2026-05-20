const Group = require("../models/Group");
const ApiError = require("../errors/ApiError");
const { parsePagination, buildPageResponse } = require("../utils/pagination");

const basePopulate = [
  { path: "createdBy", select: "name email avatarUrl" },
  { path: "members", select: "name email avatarUrl isOnline" }
];

const populateGroup = (query) => {
  let result = query;
  basePopulate.forEach((item) => {
    result = result.populate(item);
  });
  return result;
};

const listGroups = async ({ userId, search = "", page, limit }) => {
  const { page: safePage, limit: safeLimit, skip } = parsePagination({ page, limit });
  const query = {
    $or: [
      { createdBy: userId },
      { members: userId }
    ]
  };

  if (search && search.trim()) {
    query.name = new RegExp(search.trim(), "i");
  }

  const [groups, total] = await Promise.all([
    populateGroup(Group.find(query)).sort({ createdAt: -1 }).skip(skip).limit(safeLimit),
    Group.countDocuments(query)
  ]);

  return buildPageResponse(groups, total, safePage, safeLimit);
};

const createGroup = async ({ userId, name, avatarUrl = "", memberIds = [] }) => {
  const trimmedName = typeof name === "string" ? name.trim() : "";
  if (!trimmedName) {
    throw new ApiError(400, "Group name is required");
  }

  const uniqueMembers = Array.from(new Set([userId, ...memberIds]));
  const group = await Group.create({
    name: trimmedName,
    avatarUrl,
    createdBy: userId,
    members: uniqueMembers
  });

  return populateGroup(Group.findById(group._id));
};

const getGroupById = async (groupId) => {
  const group = await populateGroup(Group.findById(groupId));
  if (!group) {
    throw new ApiError(404, "Group not found");
  }
  return group;
};

const updateGroup = async ({ groupId, userId, name, avatarUrl = "", memberIds = [] }) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (String(group.createdBy) !== String(userId)) {
    throw new ApiError(403, "Only the group creator can update the group");
  }

  if (typeof name === "string" && name.trim()) {
    group.name = name.trim();
  }

  if (typeof avatarUrl === "string") {
    group.avatarUrl = avatarUrl;
  }

  const uniqueMembers = Array.from(new Set([userId, ...memberIds]));
  group.members = uniqueMembers;

  await group.save();

  return populateGroup(Group.findById(group._id));
};

const addMembers = async ({ groupId, userId, memberIds = [] }) => {
  const group = await Group.findById(groupId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (String(group.createdBy) !== String(userId)) {
    throw new ApiError(403, "Only the group creator can update members");
  }

  const currentMembers = new Set(group.members.map((member) => String(member)));
  currentMembers.add(String(userId));
  memberIds.forEach((memberId) => currentMembers.add(String(memberId)));
  group.members = Array.from(currentMembers);

  await group.save();

  return populateGroup(Group.findById(group._id));
};

module.exports = {
  listGroups,
  createGroup,
  getGroupById,
  updateGroup,
  addMembers
};
