import { NextResponse } from "next/server";

import { generateAlerts } from "@/lib/alerts";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Debt from "@/models/Debt";
import type { IDebt } from "@/types";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const debts = await Debt.find({ userId: session.user.id });
  const alerts = generateAlerts(debts as unknown as IDebt[]);
  return NextResponse.json({ alerts });
}
