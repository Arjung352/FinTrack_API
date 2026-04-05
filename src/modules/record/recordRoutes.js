// recordRoutes.js
const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
} = require("./recordController");

// Protect all routes
router.use(authenticate);

// Create (Admin only)
router.post("/", authorizeRoles("ADMIN"), createRecord);

// Read (Admin + Analyst)
router.get("/", authorizeRoles("ADMIN", "ANALYST"), getRecords);

// Update (Admin only)
router.patch("/:id", authorizeRoles("ADMIN"), updateRecord);

// Delete (Admin only)
router.delete("/:id", authorizeRoles("ADMIN"), deleteRecord);

module.exports = router;
