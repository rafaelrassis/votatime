import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const rodadas = await prisma.round.findMany({ orderBy: { numero: "desc" } });
  return NextResponse.json(rodadas);
}
