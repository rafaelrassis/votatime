const { PrismaClient } = require("@prisma/client");
const players = require("../data/players.json");
const rounds = require("../data/rounds.json");

const prisma = new PrismaClient();

async function main() {
  for (const j of players) {
    await prisma.player.upsert({
      where: { id: j.id },
      update: j,
      create: j,
    });
  }

  for (const r of rounds) {
    await prisma.round.upsert({
      where: { id: r.id },
      update: r,
      create: r,
    });
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
