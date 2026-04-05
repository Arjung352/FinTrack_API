// userUpdationValidation.js
const { z } = require("zod");

const updateRoleSchema = z.object({
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]),
});

const updateStatusSchema = z.object({
  status: z.enum(["ACTIVE", "INACTIVE"]),
});
module.exports = {
  updateRoleSchema,
  updateStatusSchema,
};
