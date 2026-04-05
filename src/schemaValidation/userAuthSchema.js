const { z } = require("zod");

const userCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).default("VIEWER"),
  status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
});

const userLoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(5, "Password must be at least 5 characters"),
});

module.exports = {
  userCreateSchema,
  userLoginSchema,
};
