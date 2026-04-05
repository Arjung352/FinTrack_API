// recordController.js
const prisma = require("../../prisma/prismaClient");
const {
  transactionCreateSchema,
  transactionUpdateSchema,
} = require("../../schemaValidation/transactionSchema");

// create record function (Admin only)
const createRecord = async (req, res) => {
  try {
    const data = req.body;
    const userId = req.user.id;
    const parsedDataWithSuccess = transactionCreateSchema.safeParse({
      ...data,
      userId,
    });
    if (!parsedDataWithSuccess.success) {
      return res
        .status(400)
        .json({ message: parsedDataWithSuccess.error.issues[0].message });
    }
    const record = await prisma.record.create({
      data: {
        ...parsedDataWithSuccess.data,
        userId,
      },
    });
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get records function (Admin and Analyst only)
const getRecords = async (req, res) => {
  try {
    const { type, category, from, to } = req.query;
    const userId = req.user.id;
    const filters = {
      userId,
      isDeleted: false,
    };

    if (type) filters.type = type;
    if (category) filters.category = category;

    if (from || to) {
      filters.date = {
        ...(from && { gte: new Date(from) }),
        ...(to && { lte: new Date(to) }),
      };
    }

    const result = await prisma.record.findMany({
      where: filters,
      orderBy: { date: "desc" },
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// update record function (Admin only)
const updateRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const parsedDataWithSuccess = transactionUpdateSchema.safeParse({
      ...data,
    });
    if (!parsedDataWithSuccess.success) {
      return res
        .status(400)
        .json({ message: parsedDataWithSuccess.error.issues[0].message });
    }
    const result = await prisma.record.update({
      where: { id },
      data: parsedDataWithSuccess.data,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete record function (Admin only)
const deleteRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await prisma.record.update({
      where: { id },
      data: { isDeleted: true }, // soft delete
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createRecord,
  getRecords,
  updateRecord,
  deleteRecord,
};
