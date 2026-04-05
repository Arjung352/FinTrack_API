// dashboardController.js
const prisma = require("../../prisma/prismaClient");

// summary for individual user
const getSummary = async (req, res) => {
  try {
    const userId = req.user.id;
    // 1. Total Income
    const totalIncome = await prisma.record.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "INCOME",
        isDeleted: false,
      },
    });

    // 2. Total Expense
    const totalExpense = await prisma.record.aggregate({
      _sum: { amount: true },
      where: {
        userId,
        type: "EXPENSE",
        isDeleted: false,
      },
    });

    // 3. Category-wise breakdown
    const categoryBreakdown = await prisma.record.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where: {
        userId,
        isDeleted: false,
      },
    });

    // 4. Recent transactions
    const recentTransactions = await prisma.record.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        date: "desc",
      },
      take: 5,
    });

    // 5. Net balance
    const income = totalIncome._sum.amount || 0;
    const expense = totalExpense._sum.amount || 0;

    res.status(200).json({
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      categoryBreakdown,
      recentTransactions,
    });
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res.status(400).json({
      message: "Internal server error",
      success: false,
    });
  }
};

// summary for everyone - overall system summary

const getOverview = async (req, res) => {
  try {
    const query = req.query;
    const trendType = query.trendType || "monthly";

    const where = {
      isDeleted: false,
    };

    // 1. Aggregations (GLOBAL)
    const totalIncome = await prisma.record.aggregate({
      _sum: { amount: true },
      where: { ...where, type: "INCOME" },
    });

    const totalExpense = await prisma.record.aggregate({
      _sum: { amount: true },
      where: { ...where, type: "EXPENSE" },
    });

    const categoryBreakdown = await prisma.record.groupBy({
      by: ["category"],
      _sum: { amount: true },
      where,
    });

    // 2. Fetch records for trends
    const records = await prisma.record.findMany({
      where,
      select: {
        amount: true,
        type: true,
        date: true,
      },
    });

    // 3. Build trends
    const trendsMap = {};

    for (const record of records) {
      const date = new Date(record.date);

      let key;

      if (trendType === "weekly") {
        const firstDay = new Date(date.getFullYear(), 0, 1);
        const week = Math.ceil(
          ((date - firstDay) / 86400000 + firstDay.getDay() + 1) / 7,
        );
        key = `${date.getFullYear()}-W${week}`;
      } else {
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      }

      if (!trendsMap[key]) {
        trendsMap[key] = { income: 0, expense: 0 };
      }

      if (record.type === "INCOME") {
        trendsMap[key].income += record.amount;
      } else {
        trendsMap[key].expense += record.amount;
      }
    }

    const trends = Object.entries(trendsMap)
      .map(([period, values]) => ({
        period,
        income: values.income,
        expense: values.expense,
        net: values.income - values.expense,
      }))
      .sort((a, b) => a.period.localeCompare(b.period));

    // 4. Final response
    const income = totalIncome._sum.amount || 0;
    const expense = totalExpense._sum.amount || 0;

    res.status(200).json({
      totalIncome: income,
      totalExpense: expense,
      netBalance: income - expense,
      categoryBreakdown,
      trends,
    });
  } catch (error) {
    res.status(400).json({
      message: "Internal server error",
      success: false,
    });
  }
};
module.exports = {
  getSummary,
  getOverview,
};
