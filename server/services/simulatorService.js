function simulatePayoff(debts, monthlyExtra = 0, method = 'avalanche') {
  if (!debts.length) return { months: 0, totalInterest: 0, schedule: [] };

  // Deep clone debts
  let remaining = debts.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    balance: d.balance,
    rate: d.interestRate / 100 / 12,
    minPayment: d.minPayment,
    paid: false,
  }));

  const totalInterestByDebt = {};
  remaining.forEach((d) => (totalInterestByDebt[d.id] = 0));

  let month = 0;
  const schedule = [];
  const MAX_MONTHS = 600;

  while (remaining.some((d) => !d.paid) && month < MAX_MONTHS) {
    month++;

    // Sort unpaid debts by strategy
    const unpaid = remaining.filter((d) => !d.paid);
    unpaid.sort((a, b) =>
      method === 'avalanche' ? b.rate - a.rate : a.balance - b.balance
    );

    // Accrue interest on all unpaid
    unpaid.forEach((d) => {
      const interest = d.balance * d.rate;
      totalInterestByDebt[d.id] += interest;
      d.balance += interest;
    });

    // Apply minimum payments
    let extra = monthlyExtra;
    unpaid.forEach((d) => {
      const pay = Math.min(d.balance, d.minPayment);
      d.balance -= pay;
      if (d.balance < 0.01) d.paid = true;
    });

    // Apply extra to focus debt (first in sorted order)
    const focus = unpaid.find((d) => !d.paid);
    if (focus && extra > 0) {
      const pay = Math.min(focus.balance, extra);
      focus.balance -= pay;
      if (focus.balance < 0.01) focus.paid = true;
    }

    // Redistribute freed minimum payments
    unpaid
      .filter((d) => d.paid)
      .forEach((d) => (extra += d.minPayment));

    schedule.push({
      month,
      balances: remaining.map((d) => ({ id: d.id, name: d.name, balance: Math.max(0, d.balance) })),
    });
  }

  const totalInterest = Object.values(totalInterestByDebt).reduce((s, v) => s + v, 0);
  return { months: month, totalInterest, schedule };
}

module.exports = { simulatePayoff };
