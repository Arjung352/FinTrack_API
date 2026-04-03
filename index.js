require("dotenv").config();

const express = require("express");
const app = express();
const prisma = require("./src/lib/prisma");

const PORT = process.env.PORT || 3000;

// check database connection before starting the server
async function testDatabaseConnection() {
  try {
    const user = await prisma.user.findMany({ take: 1 });
    console.log("Database connection successful");
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    process.exit(1);
  }
}
// home route
app.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findMany();
    res.status(200).json({
      data: user,
      response: "Data fetched successfully from the database",
    });
  } catch (error) {
    res.status(400).json({ message: error });
  }
});

// sample user input
async function createSampleUser() {
  try {
    const user = await prisma.user.create({
      data: {
        name: "Arjun",
        email: "arjung352@gmail.com",
        passwordHash: "password",
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    console.log(user);
  } catch (error) {
    console.log(error);
  }
}
// server start function
async function startServer() {
  try {
    await testDatabaseConnection();
    // createSampleUser();
    app.listen(PORT, () => {
      console.log(`🚀 FinTrack API server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
