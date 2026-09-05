import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { footballApi } from "@/lib/footballApi";
import { normalizar } from "@/lib/escudos";

// Sincroniza escudo + apiId dos times do Brasileirão (mesma coisa que
// scripts/sync-jogos.js faz localmente), só que rodando aqui — pra quem só
// tem acesso pelo celular/Vercel e não consegue rodar o script com a chave
// da football-data.org na própria máquina. Idempotente, 1 chamada à API.
export async function GET() {
  try {
    const { teams } = await footballApi("/competitions/BSA/teams");
    let total = 0;
    for (const t of teams || []) {
      if (!t.crest) continue;
      const id = normalizar(t.name);
      await prisma.team.upsert({
        where: { id },
        update: { nome: t.name, escudo: t.crest, apiId: t.id },
        create: { id, nome: t.name, escudo: t.crest, apiId: t.id },
      });
      total++;
    }
    return NextResponse.json({ ok: true, sincronizados: total });
  } catch (e) {
    return NextResponse.json({ ok: false, erro: e.message }, { status: 500 });
  }
}
