// record.service.js
const prisma = require("../../prisma/prismaClient");

exports.createRecord = async (data, userId) => {
  return prisma.record.create({
    data: {
      ...data,
      userId,
    },
  });
};

exports.getRecords = async (query, userId) => {
  const { type, category, from, to } = query;

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

  return prisma.record.findMany({
    where: filters,
    orderBy: { date: "desc" },
  });
};

exports.updateRecord = async (id, data) => {
  return prisma.record.update({
    where: { id },
    data,
  });
};

exports.deleteRecord = async (id) => {
  return prisma.record.update({
    where: { id },
    data: { isDeleted: true }, // soft delete
  });
};
