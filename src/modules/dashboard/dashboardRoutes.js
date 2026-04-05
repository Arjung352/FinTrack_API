// dashboardRoutes.js
const express = require("express");
const router = express.Router();

const authenticate = require("../../middleware/authMiddleware");
const authorizeRoles = require("../../middleware/roleMiddleware");

const { getSummary, getOverview } = require("./dashboardController");

// route to get summary for individual user - only for admin and analyst
router.get(
  "/summary",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST"),
  getSummary,
);
// All roles can access dashboard
router.get(
  "/overview",
  authenticate,
  authorizeRoles("ADMIN", "ANALYST", "VIEWER"),
  getOverview,
);
module.exports = router;
