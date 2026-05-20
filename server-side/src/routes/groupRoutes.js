const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
  validateGroupCreateBody,
  validateGroupUpdateBody,
  validateGroupMembersBody
} = require("../validators/groupValidators");
const {
  getGroups,
  createGroup,
  getGroupById,
  updateGroup,
  addMembers
} = require("../controllers/groupController");

const router = express.Router();

router.get("/", authMiddleware, getGroups);
router.post("/", authMiddleware, validateRequest(validateGroupCreateBody), createGroup);
router.get("/:groupId", authMiddleware, getGroupById);
router.put("/:groupId", authMiddleware, validateRequest(validateGroupUpdateBody), updateGroup);
router.post("/:groupId/members", authMiddleware, validateRequest(validateGroupMembersBody), addMembers);

module.exports = router;
