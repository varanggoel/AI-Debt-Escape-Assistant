import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { simulatePayoff } from "@/lib/simulator";
import Debt from "@/models/Debt";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const extra = parseFloat(searchParams.get("extraPayment") ?? "0") || 0;

  await connectDB();
  const debts = await Debt.find({ userId: session.user.id });
  if (!debts.length) return NextResponse.json({ avalanche: null, snowball: null });

  const input = debts.map((d) => ({
    _id: d._id as { toString(): string },
    name: d.name,
    balance: d.balance,
    interestRate: d.interestRate,
    minPayment: d.minPayment,
  }));

  const avalanche = simulatePayoff(input, extra, "avalanche");
  const snowball = simulatePayoff(input, extra, "snowball");
  return NextResponse.json({ avalanche, snowball, debtCount: debts.length, extra });
}
