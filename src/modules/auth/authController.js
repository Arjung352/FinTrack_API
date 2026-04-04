// authController.js
const prisma = require("../../prisma/prismaClient");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  userCreateSchema,
  userLoginSchema,
} = require("../../schemaValidation/userSchema");

// register user function
const register = async (req, res) => {
  // validate input first
  const { name, email, password } = req.body;
  const parsedDataWithSuccess = userCreateSchema.safeParse({
    name,
    email,
    password,
  });

  if (!parsedDataWithSuccess.success) {
    return res
      .status(400)
      .json({ message: parsedDataWithSuccess.error.issues[0].message });
  }

  // check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  // hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.user.create({
    data: {
      name: parsedDataWithSuccess.data.name,
      email: parsedDataWithSuccess.data.email,
      passwordHash: passwordHash,
      role: "VIEWER", // default role
      status: "ACTIVE",
    },
  });

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: user.id,
    },
  });
};

// Login user function

const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const parsedDataWithSuccess = userLoginSchema.safeParse({
    email,
    password,
  });

  if (!parsedDataWithSuccess.success) {
    return res
      .status(400)
      .json({ message: parsedDataWithSuccess.error.issues[0].message });
  }

  // generate JWT
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  res.status(200).json({
    message: "User logged in successfully",
    token,
    user: {
      id: user.id,
    },
  });
};
module.exports = {
  register,
  login,
};
