import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  if (!name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ message: "Name, email, and password are required" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
  }

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ message: "An account with this email already exists" }, { status: 409 });
  }

  // Password is hashed by the User model's pre-save hook.
  await User.create({ name, email, password });

  return NextResponse.json({ message: "Account created" }, { status: 201 });
}
