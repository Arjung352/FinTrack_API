// user.service.js
const prisma = require("../../prisma/prismaClient");
const {
  updateStatusSchema,
  updateRoleSchema,
} = require("../../schemaValidation/userValidation");

// get all users ADMIN ONLY
const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
// update user role ADMIN ONLY
const updateUserRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;

    const parsed = updateRoleSchema.safeParse({ role });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid role value" });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        role: parsed.data.role,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update user status ADMIN ONLY
const updateUserStatus = async (req, res) => {
  try {
    const userId = req.params.id;
    const { status } = req.body;
    const parsed = updateStatusSchema.safeParse({ status });
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid status value" });
      return;
    }
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        status: parsed.data.status,
      },
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
module.exports = {
  getUsers,
  updateUserRole,
  updateUserStatus,
};
