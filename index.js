require("dotenv").config();

const express = require("express");
const app = express();
const prisma = require("./src/lib/prisma");

const PORT = process.env.PORT || 3000;

async function testDatabaseConnection() {
  try {
    await prisma.user.findMany({ take: 1 });
    console.log("✅ Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}
app.get("/", (req, res) => {
  res.send("Welcome to the FinTrack API! Use /api/v1 for endpoints.");
});
async function startServer() {
  try {
    await testDatabaseConnection();

    app.listen(PORT, () => {
      console.log(`🚀 FinTrack API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
