import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { footballApi } from "@/lib/footballApi";

// Elenco por time, pro comparativo em /previsao/[id]. O nosso (Grêmio) já
// está semeado no banco (prisma/seed.js) com votos reais; o do adversário é
// buscado na football-data.org na primeira vez que alguém abre aquele
// confronto e fica cacheado no Postgres (sem votos — a torcida só vota na
// escalação do próprio time).
export async function GET(request) {
  const time = new URL(request.url).searchParams.get("time");
  if (!time) {
    return NextResponse.json({ error: "informe ?time=<id do time>" }, { status: 400 });
  }

  const cache = await prisma.player.findMany({
    where: { time },
    orderBy: { numero: "asc" },
  });
  if (cache.length > 0) return NextResponse.json(cache);

  const equipe = await prisma.team.findUnique({ where: { id: time } });
  if (!equipe?.apiId) return NextResponse.json([]);

  try {
    const { squad } = await footballApi(`/teams/${equipe.apiId}`);
    const jogadores = (squad || [])
      .map((j) => ({
        id: `${time}-${j.id}`,
        nome: j.name,
        apelido: j.name,
        numero: j.shirtNumber || 0,
        posicao: j.position || "",
        votos: 0,
        time,
      }))
      .sort((a, b) => (a.numero || 99) - (b.numero || 99));

    if (jogadores.length > 0) {
      await prisma.$transaction(
        jogadores.map((j) => prisma.player.upsert({ where: { id: j.id }, update: j, create: j }))
      );
    }
    return NextResponse.json(jogadores);
  } catch (e) {
    console.error(`[squad] falha ao buscar elenco de ${time}:`, e.message);
    return NextResponse.json([]);
  }
}
