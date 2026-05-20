const asyncHandler = require("../utils/asyncHandler");
const { registerUser, loginUser } = require("../services/authService");

const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
});

const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.json(result);
});

module.exports = {
  register,
  login
};
