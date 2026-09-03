import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const atual = await prisma.round.findFirst({ where: { atual: true } });
  const historico = await prisma.round.findMany({
    where: { atual: false },
    orderBy: { numero: "desc" },
  });
  return NextResponse.json({ atual, historico });
}
