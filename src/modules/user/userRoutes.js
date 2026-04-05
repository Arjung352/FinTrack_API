// userRoutes.js
const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const {
  getUsers,
  updateUserRole,
  updateUserStatus,
} = require("./userController");

// Protect all routes
router.use(authenticate);

// Only ADMIN can access user management
router.get("/", authorizeRoles("ADMIN"), getUsers);

router.patch("/:id/role", authorizeRoles("ADMIN"), updateUserRole);

router.patch("/:id/status", authorizeRoles("ADMIN"), updateUserStatus);

module.exports = router;
