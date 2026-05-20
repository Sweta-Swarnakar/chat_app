const asyncHandler = require("../utils/asyncHandler");
const { listGroups, createGroup, getGroupById, updateGroup, addMembers } = require("../services/groupService");

const getGroups = asyncHandler(async (req, res) => {
  const result = await listGroups({
    userId: req.user.id,
    search: req.query.search || "",
    page: req.query.page,
    limit: req.query.limit
  });
  res.json(result);
});

const createNewGroup = asyncHandler(async (req, res) => {
  const result = await createGroup({
    userId: req.user.id,
    name: req.body.name,
    avatarUrl: req.body.avatarUrl,
    memberIds: req.body.memberIds || []
  });
  res.status(201).json(result);
});

const fetchGroupById = asyncHandler(async (req, res) => {
  const result = await getGroupById(req.params.groupId);
  res.json(result);
});

const updateExistingGroup = asyncHandler(async (req, res) => {
  const result = await updateGroup({
    groupId: req.params.groupId,
    userId: req.user.id,
    name: req.body.name,
    avatarUrl: req.body.avatarUrl,
    memberIds: req.body.memberIds || []
  });
  res.json(result);
});

const updateGroupMembers = asyncHandler(async (req, res) => {
  const result = await addMembers({
    groupId: req.params.groupId,
    userId: req.user.id,
    memberIds: req.body.memberIds || []
  });
  res.json(result);
});

module.exports = {
  getGroups,
  createGroup: createNewGroup,
  getGroupById: fetchGroupById,
  updateGroup: updateExistingGroup,
  addMembers: updateGroupMembers
};
