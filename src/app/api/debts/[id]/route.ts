import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import Debt from "@/models/Debt";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();
  const debt = await Debt.findOne({ _id: id, userId: session.user.id });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(debt);
}

export async function PATCH(req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  await connectDB();
  const debt = await Debt.findOneAndUpdate(
    { _id: id, userId: session.user.id },
    { ...body, updatedAt: new Date() },
    { new: true, runValidators: true }
  );
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(debt);
}

export async function DELETE(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await connectDB();
  const debt = await Debt.findOneAndDelete({ _id: id, userId: session.user.id });
  if (!debt) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ message: "Deleted" });
}
