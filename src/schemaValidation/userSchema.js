const { z } = require("zod");

const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["viewer", "analyst", "admin"]).default("viewer"),
  status: z.enum(["active", "inactive", "pending"]).default("active"),
});

const userUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional(),
  role: z.enum(["viewer", "analyst", "admin"]).optional(),
  status: z.enum(["active", "inactive", "pending"]).optional(),
});

module.exports = {
  userCreateSchema,
  userUpdateSchema,
};
