import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { playerId } = await req.json();
  if (!playerId) {
    return NextResponse.json({ erro: "playerId é obrigatório" }, { status: 400 });
  }

  const jogador = await prisma.player.update({
    where: { id: playerId },
    data: { votos: { increment: 1 } },
  });

  return NextResponse.json(jogador);
}
