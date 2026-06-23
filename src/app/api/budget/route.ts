import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Budget from "@/models/Budget";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const month = parseInt(searchParams.get("month") ?? "") || now.getMonth() + 1;
  const year = parseInt(searchParams.get("year") ?? "") || now.getFullYear();

  await connectDB();
  const budget = await Budget.findOne({ userId: session.user.id, month, year });
  return NextResponse.json(budget ?? null);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { month, year, income, expenses } = await req.json();
  if (!month || !year || income == null) {
    return NextResponse.json({ message: "month, year, and income are required" }, { status: 400 });
  }

  await connectDB();
  const budget = await Budget.findOneAndUpdate(
    { userId: session.user.id, month, year },
    { income, expenses: expenses ?? [], updatedAt: new Date() },
    { new: true, upsert: true, runValidators: true }
  );
  return NextResponse.json(budget);
}
