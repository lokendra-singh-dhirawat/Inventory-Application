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

  const Strategy = await prisma.category.upsert({
    where: { name: "Strategy & Thinking" },
    update: {},
    create: { name: "Strategy & Thinking" },
  });

  const Simulation = await prisma.category.upsert({
    where: { name: "Simulation" },
    update: {},
    create: { name: "Simulation" },
  });

  const Puzzle = await prisma.category.upsert({
    where: { name: "Puzzle" },
    update: {},
    create: { name: "Puzzle" },
  });

  const Sports = await prisma.category.upsert({
    where: { name: "Sports" },
    update: {},
    create: { name: "Sports" },
  });

  const Racing = await prisma.category.upsert({
    where: { name: "Racing" },
    update: {},
    create: { name: "Racing" },
  });

  const Fighting = await prisma.category.upsert({
    where: { name: "Fighting" },
    update: {},
    create: { name: "Fighting" },
  });

  const Horror = await prisma.category.upsert({
    where: { name: "Horror" },
    update: {},
    create: { name: "Horror" },
  });

  const Indie = await prisma.category.upsert({
    where: { name: "Indie" },
    update: {},
    create: { name: "Indie" },
  });

  const OpenWorld = await prisma.category.upsert({
    where: { name: "Open World" },
    update: {},
    create: { name: "Open World" },
  });

  const Platformer = await prisma.category.upsert({
    where: { name: "Platformer" },
    update: {},
    create: { name: "Platformer" },
  });

  const Shooter = await prisma.category.upsert({
    where: { name: "Shooter" },
    update: {},
    create: { name: "Shooter" },
  });

  const Multiplayer = await prisma.category.upsert({
    where: { name: "Multiplayer" },
    update: {},
    create: { name: "Multiplayer" },
  });

  const Card = await prisma.category.upsert({
    where: { name: "Card" },
    update: {},
    create: { name: "Card" },
  });

  const Music = await prisma.category.upsert({
    where: { name: "Music" },
    update: {},
    create: { name: "Music" },
  });

  const Educational = await prisma.category.upsert({
    where: { name: "Educational" },
    update: {},
    create: { name: "Educational" },
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
