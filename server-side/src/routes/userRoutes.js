const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { getUsers, getMe, updateMe, getUserById } = require("../controllers/userController");
const validateRequest = require("../middleware/validateRequest");
const { validateUpdateMeBody } = require("../validators/userValidators");

const router = express.Router();

router.get("/", authMiddleware, getUsers);
router.get("/me", authMiddleware, getMe);
router.put("/me", authMiddleware, validateRequest(validateUpdateMeBody), updateMe);
router.get("/:userId", authMiddleware, getUserById);

module.exports = router;
