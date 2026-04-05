require("dotenv").config();

const express = require("express");
const cors = require("cors");
const app = express();
const prisma = require("./prisma/prismaClient");
const authRoutes = require("./modules/auth/authRoute");
const recordRoutes = require("./modules/record/recordRoutes");
const userRoutes = require("./modules/user/userRoutes");
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes

app.use("/api/auth", authRoutes);
app.use("/api/records", recordRoutes);
app.use("/api/users", userRoutes);

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
    res.status(200).json({
      message: "Message from backend",
      success: true,
    });
  } catch (error) {
    res.status(400).json({ message: error, success: false });
  }
});

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
// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    success: false,
  });
});

startServer();
