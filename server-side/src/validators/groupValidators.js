const validateGroupCreateBody = (req) => {
  const errors = [];
  const { name, avatarUrl, memberIds } = req.body || {};

  if (!name || typeof name !== "string" || !name.trim()) {
    errors.push("Group name is required");
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    errors.push("avatarUrl must be a string");
  }

  if (memberIds !== undefined && (!Array.isArray(memberIds) || memberIds.some((id) => typeof id !== "string"))) {
    errors.push("memberIds must be an array of strings");
  }

  return errors;
};

const validateGroupUpdateBody = (req) => validateGroupCreateBody(req);

const validateGroupMembersBody = (req) => {
  const errors = [];
  const { memberIds } = req.body || {};

  if (!Array.isArray(memberIds) || memberIds.some((id) => typeof id !== "string")) {
    errors.push("memberIds must be an array of strings");
  }

  return errors;
};

module.exports = {
  validateGroupCreateBody,
  validateGroupUpdateBody,
  validateGroupMembersBody
};
