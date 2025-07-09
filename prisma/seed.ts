import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding categories...");

  const action = await prisma.category.upsert({
    where: { name: "Action" },
    update: {},
    create: { name: "Action" },
  });

  const rpg = await prisma.category.upsert({
    where: { name: "RPG" },
    update: {},
    create: { name: "RPG" },
  });

  const adventure = await prisma.category.upsert({
    where: { name: "Adventure" },
    update: {},
    create: { name: "Adventure" },
  });

  console.log(`Created/found categories:`);
  console.log(`- Action ID: ${action.id}`);
  console.log(`- RPG ID: ${rpg.id}`);
  console.log(`- Adventure ID: ${adventure.id}`);

  console.log("Seeding users...");
  const adminPassword = await bcrypt.hash("Admin@123", 10);
  const userPassword = await bcrypt.hash("User@123", 10);

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: { password: adminPassword, name: "Admin User", role: "admin" },
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin User",
      role: "admin",
    },
  });

  // Regular user
  const regularUser = await prisma.user.upsert({
    where: { email: "user@example.com" },
    update: { password: userPassword, name: "Regular User", role: "user" },
    create: {
      email: "user@example.com",
      password: userPassword,
      name: "Regular User",
      role: "user",
    },
  });

  console.log(
    `Admin user created/updated: ${adminUser.email} (Role: ${adminUser.role})`
  );
  console.log(
    `Regular user created/updated: ${regularUser.email} (Role: ${regularUser.role})`
  );
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
