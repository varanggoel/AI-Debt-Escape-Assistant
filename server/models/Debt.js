const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  type: {
    type: String,
    required: true,
    enum: ['credit_card', 'student_loan', 'personal_loan', 'mortgage', 'auto_loan', 'medical', 'other'],
  },
  balance: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, required: true, min: 0, max: 100 },
  minPayment: { type: Number, required: true, min: 0 },
  dueDate: { type: Number, min: 1, max: 31 },
  notes: { type: String, trim: true, maxlength: 500 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

debtSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

debtSchema.virtual('monthlyInterestCharge').get(function () {
  return (this.balance * this.interestRate) / 100 / 12;
});

module.exports = mongoose.model('Debt', debtSchema);
