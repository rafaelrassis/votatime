// Baixa escudos reais e jogos reais (football-data.org) e grava no Postgres.
// Uso: npm run sync:jogos
// Precisa de FOOTBALL_DATA_API_KEY no .env (conta grátis em football-data.org).
const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

function carregarEnv() {
  const arq = path.join(__dirname, "..", ".env");
  if (!fs.existsSync(arq)) return;
  for (const linha of fs.readFileSync(arq, "utf8").split("\n")) {
    const m = linha.match(/^([\w.-]+)\s*=\s*(.*)?$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = (m[2] || "").trim().replace(/^["']|["']$/g, "");
    }
  }
}
carregarEnv();

const prisma = new PrismaClient();

// Códigos das principais competições cobertas pelo plano free do football-data.org.
const COMPETICOES = ["BSA", "CL", "PL", "PD", "BL1", "FL1", "SA"];
const JANELA_DIAS = 15; // hoje até +15 dias, pra lista de "jogos reais"

function normalizar(nome) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(fc|cf|sc|ec|se|ac|afc|cd|sad|clube|futebol|de|do|da)\b/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

async function chamar(caminho) {
  const res = await fetch(`https://api.football-data.org/v4${caminho}`, {
    headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY },
  });
  if (!res.ok) {
    throw new Error(`football-data.org respondeu ${res.status} em ${caminho}: ${await res.text()}`);
  }
  return res.json();
}

// Escudos: pega o elenco de clubes de cada competição (cobre times mesmo
// sem jogo marcado nos próximos dias, ex. adversários das rodadas mock).
async function sincronizarEscudos() {
  let total = 0;
  for (const codigo of COMPETICOES) {
    const { teams } = await chamar(`/competitions/${codigo}/teams`);
    for (const t of teams || []) {
      if (!t.crest) continue;
      const id = normalizar(t.name);
      await prisma.team.upsert({
        where: { id },
        update: { nome: t.name, escudo: t.crest },
        create: { id, nome: t.name, escudo: t.crest },
      });
      total++;
    }
    // plano free: ~10 chamadas/min
    await new Promise((r) => setTimeout(r, 6500));
  }
  console.log(`${total} escudos sincronizados.`);
}

// Jogos reais: partidas das próximas semanas, pra página /jogos.
async function sincronizarPartidas() {
  const hoje = new Date();
  const fim = new Date(hoje.getTime() + JANELA_DIAS * 86400000);
  const dateFrom = hoje.toISOString().slice(0, 10);
  const dateTo = fim.toISOString().slice(0, 10);
  const { matches } = await chamar(
    `/matches?competitions=${COMPETICOES.join(",")}&dateFrom=${dateFrom}&dateTo=${dateTo}`
  );

  for (const p of matches || []) {
    const dados = {
      competition: p.competition.name,
      competitionCode: p.competition.code,
      matchday: p.matchday ?? null,
      utcDate: new Date(p.utcDate),
      status: p.status,
      homeTeam: p.homeTeam.name,
      homeCrest: p.homeTeam.crest || "",
      awayTeam: p.awayTeam.name,
      awayCrest: p.awayTeam.crest || "",
      homeScore: p.score?.fullTime?.home ?? null,
      awayScore: p.score?.fullTime?.away ?? null,
    };
    await prisma.match.upsert({
      where: { id: p.id },
      update: dados,
      create: { id: p.id, ...dados },
    });
  }
  console.log(`${(matches || []).length} partidas sincronizadas.`);
}

async function main() {
  if (!process.env.FOOTBALL_DATA_API_KEY) {
    console.error("Defina FOOTBALL_DATA_API_KEY no .env (conta grátis em football-data.org).");
    process.exit(1);
  }
  await sincronizarEscudos();
  await sincronizarPartidas();
  console.log("Sincronização concluída.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
