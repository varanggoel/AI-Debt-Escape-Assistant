import mongoose, { type Model } from "mongoose";

export interface IBudgetDocument extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  month: number;
  year: number;
  income: number;
  expenses: Array<{ category: string; amount: number }>;
  updatedAt: Date;
}

const budgetSchema = new mongoose.Schema<IBudgetDocument>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  income: { type: Number, required: true, min: 0 },
  expenses: [
    {
      category: { type: String, required: true },
      amount: { type: Number, required: true, min: 0 },
    },
  ],
  updatedAt: { type: Date, default: Date.now },
});

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

const Budget: Model<IBudgetDocument> =
  mongoose.models.Budget || mongoose.model("Budget", budgetSchema);

export default Budget;
