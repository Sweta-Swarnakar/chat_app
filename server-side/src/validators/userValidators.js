const validateUpdateMeBody = (req) => {
  const errors = [];
  const { name, avatarUrl } = req.body || {};

  if (name !== undefined && typeof name !== "string") {
    errors.push("Name must be a string");
  }

  if (avatarUrl !== undefined && typeof avatarUrl !== "string") {
    errors.push("avatarUrl must be a string");
  }

  return errors;
};

module.exports = {
  validateUpdateMeBody
};
