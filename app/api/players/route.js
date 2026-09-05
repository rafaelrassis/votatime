import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const jogadores = await prisma.player.findMany({
    where: { time: "gremio" },
    orderBy: { numero: "asc" },
  });
  return NextResponse.json(jogadores);
}
