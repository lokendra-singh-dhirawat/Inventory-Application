import { PrismaClient } from "@prisma/client";

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
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
