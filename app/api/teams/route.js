import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const times = await prisma.team.findMany();
  return NextResponse.json(times);
}
