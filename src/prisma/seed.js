// prisma/seed.js
const prisma = require("./prismaClient");
const bcrypt = require("bcryptjs");

async function main() {
  const hashedPassword = await bcrypt.hash("Admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@finance.com",
      passwordHash: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });

  console.log("Admin user seeded");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
