import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Debt from "@/models/Debt";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await connectDB();
  const debts = await Debt.find({ userId: session.user.id }).sort({ balance: -1 });
  return NextResponse.json(debts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  await connectDB();
  const debt = await Debt.create({ ...body, userId: session.user.id });
  return NextResponse.json(debt, { status: 201 });
}
