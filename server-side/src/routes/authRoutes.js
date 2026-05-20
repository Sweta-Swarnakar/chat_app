
const express = require("express");
const validateRequest = require("../middleware/validateRequest");
const { validateAuthBody } = require("../validators/authValidators");
const router = express.Router();

const {
  register,
  login
} = require("../controllers/authController");

router.post("/register", validateRequest(validateAuthBody), register);
router.post("/login", validateRequest(validateAuthBody), login);

module.exports = router;
