// Preenche a escalação final da rodada 12 (Grêmio x Internacional), se ainda
// não tiver sido aplicada. Idempotente e nunca falha o build: não mexe em
// votos/votantes, só completa escalacao/escalacaoAdversario se estiverem
// vazios. Rodado automaticamente no build (ver package.json) porque não dá
// pra rodar `npm run db:seed` manualmente contra o banco de produção agora.
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const rodada = await prisma.round.findUnique({ where: { id: "r12" } });
  if (!rodada) {
    console.log("[fix-r12] rodada r12 não encontrada, pulando.");
    return;
  }

  const rounds = JSON.parse(
    fs.readFileSync(path.join(__dirname, "..", "data", "rounds.json"), "utf8")
  );
  const fonte = rounds.find((r) => r.id === "r12");
  if (!fonte) return;

  const data = {};
  if (!rodada.escalacao || rodada.escalacao.length === 0) data.escalacao = fonte.escalacao;
  if (!rodada.escalacaoAdversario || rodada.escalacaoAdversario.length === 0) {
    data.escalacaoAdversario = fonte.escalacaoAdversario;
  }

  if (Object.keys(data).length === 0) {
    console.log("[fix-r12] já preenchido, nada a fazer.");
    return;
  }

  await prisma.round.update({ where: { id: "r12" }, data });
  console.log("[fix-r12] escalação da rodada 12 preenchida:", Object.keys(data).join(", "));
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error("[fix-r12] erro (ignorado, não bloqueia o build):", e.message);
    await prisma.$disconnect();
  });
