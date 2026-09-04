import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req) {
  const { roundId, lado } = await req.json();
  if (!roundId || !["casa", "fora"].includes(lado)) {
    return NextResponse.json({ erro: "dados inválidos" }, { status: 400 });
  }
  const campo = lado === "casa" ? "votosCasa" : "votosFora";
  const rodada = await prisma.round.update({
    where: { id: roundId },
    data: { [campo]: { increment: 1 } },
  });
  return NextResponse.json(rodada);
}
