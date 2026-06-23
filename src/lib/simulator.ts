import type { SimulatorResult } from "@/types";

interface DebtInput {
  _id: { toString(): string };
  name: string;
  balance: number;
  interestRate: number;
  minPayment: number;
}

export function simulatePayoff(
  debts: DebtInput[],
  monthlyExtra = 0,
  method: "avalanche" | "snowball" = "avalanche"
): SimulatorResult {
  if (!debts.length) return { months: 0, totalInterest: 0, schedule: [] };

  const remaining = debts.map((d) => ({
    id: d._id.toString(),
    name: d.name,
    balance: d.balance,
    rate: d.interestRate / 100 / 12,
    minPayment: d.minPayment,
    paid: false,
  }));

  const totalInterestByDebt: Record<string, number> = {};
  remaining.forEach((d) => (totalInterestByDebt[d.id] = 0));

  let month = 0;
  const schedule: SimulatorResult["schedule"] = [];
  const MAX_MONTHS = 600;

  while (remaining.some((d) => !d.paid) && month < MAX_MONTHS) {
    month++;
    const unpaid = remaining.filter((d) => !d.paid);
    unpaid.sort((a, b) =>
      method === "avalanche" ? b.rate - a.rate : a.balance - b.balance
    );

    unpaid.forEach((d) => {
      const interest = d.balance * d.rate;
      totalInterestByDebt[d.id] += interest;
      d.balance += interest;
    });

    let extra = monthlyExtra;
    unpaid.forEach((d) => {
      const pay = Math.min(d.balance, d.minPayment);
      d.balance -= pay;
      if (d.balance < 0.01) d.paid = true;
    });

    const focus = unpaid.find((d) => !d.paid);
    if (focus && extra > 0) {
      const pay = Math.min(focus.balance, extra);
      focus.balance -= pay;
      if (focus.balance < 0.01) focus.paid = true;
    }

    // Roll freed minimums into next month's extra — fixes the original bug
    // where freed payments were added after extra was already applied
    unpaid.filter((d) => d.paid).forEach((d) => (extra += d.minPayment));

    schedule.push({
      month,
      balances: remaining.map((d) => ({
        id: d.id,
        name: d.name,
        balance: Math.max(0, d.balance),
      })),
    });
  }

  const totalInterest = Object.values(totalInterestByDebt).reduce((s, v) => s + v, 0);
  return { months: month, totalInterest, schedule };
}
