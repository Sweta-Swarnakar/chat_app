const validateAuthBody = (req) => {
  const errors = [];
  const { name, email, password } = req.body || {};

  if (!email || typeof email !== "string" || !email.trim()) {
    errors.push("Email is required");
  }

  if (!password || typeof password !== "string" || !password.trim()) {
    errors.push("Password is required");
  }

  if (req.path.includes("register") && (!name || typeof name !== "string" || !name.trim())) {
    errors.push("Name is required");
  }

  return errors;
};

module.exports = {
  validateAuthBody
};
