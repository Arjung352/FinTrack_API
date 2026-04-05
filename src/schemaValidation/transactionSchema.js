const { z } = require("zod");

const transactionCreateSchema = z.object({
  amount: z.number().positive("Amount must be a positive number"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.coerce.date(),
  note: z.string().max(500).optional(),
  userId: z.string().uuid("Invalid user ID format"),
  isDeleted: z.boolean().default(false),
});

const transactionUpdateSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).optional(),
  date: z.coerce.date().optional(),
  note: z.string().max(500).optional(),
  isDeleted: z.boolean().optional(),
});

module.exports = {
  transactionCreateSchema,
  transactionUpdateSchema,
};
