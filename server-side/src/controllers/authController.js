
const bcrypt = require("bcryptjs");

const User = require("../models/User");

const {
  generateAccessToken,
  generateRefreshToken,
  generateAuthPayload
} = require("../services/tokenService");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
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

    res.status(201).json({
      user: generateAuthPayload(user),
      accessToken,
      refreshToken
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

const login = async (req, res) => {
  try {

    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      user: generateAuthPayload(user),
      accessToken,
      refreshToken
    });

  } catch (error) {
    res.status(500).json(error.message);
  }
};

module.exports = {
  register,
  login
};
