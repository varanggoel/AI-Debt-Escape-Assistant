const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0 },
});

const budgetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  income: { type: Number, required: true, min: 0 },
  expenses: [expenseSchema],
  updatedAt: { type: Date, default: Date.now },
});

budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

budgetSchema.virtual('totalExpenses').get(function () {
  return this.expenses.reduce((sum, e) => sum + e.amount, 0);
});

budgetSchema.virtual('surplus').get(function () {
  return this.income - this.totalExpenses;
});

module.exports = mongoose.model('Budget', budgetSchema);
