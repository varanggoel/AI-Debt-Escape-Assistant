import mongoose, { type Model } from "mongoose";

import type { DebtType } from "@/types";

export interface IDebtDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: DebtType;
  balance: number;
  interestRate: number;
  minPayment: number;
  dueDate?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const debtSchema = new mongoose.Schema<IDebtDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ["credit_card", "student_loan", "personal_loan", "mortgage", "auto_loan", "medical", "other"],
  },
  balance: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, required: true, min: 0, max: 100 },
  minPayment: { type: Number, required: true, min: 0 },
  dueDate: { type: Number, min: 1, max: 31 },
  notes: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

debtSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Debt: Model<IDebtDocument> =
  mongoose.models.Debt || mongoose.model("Debt", debtSchema);

export default Debt;
