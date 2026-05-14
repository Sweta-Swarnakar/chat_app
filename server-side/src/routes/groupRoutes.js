const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const {
  getGroups,
  createGroup,
  getGroupById
} = require("../controllers/groupController");

const router = express.Router();

router.get("/", authMiddleware, getGroups);
router.post("/", authMiddleware, createGroup);
router.get("/:groupId", authMiddleware, getGroupById);

module.exports = router;
