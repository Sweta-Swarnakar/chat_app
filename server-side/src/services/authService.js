const bcrypt = require("bcryptjs");
const User = require("../models/User");
const ApiError = require("../errors/ApiError");
const {
  generateAccessToken,
  generateRefreshToken,
  generateAuthPayload
} = require("./tokenService");

const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    avatarUrl: ""
  });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: generateAuthPayload(user),
    accessToken,
    refreshToken
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "Invalid credentials");
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new ApiError(400, "Invalid credentials");
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user: generateAuthPayload(user),
    accessToken,
    refreshToken
  };
};

module.exports = {
  registerUser,
  loginUser
};
