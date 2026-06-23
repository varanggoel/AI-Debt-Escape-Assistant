import type { DebtAlert, IDebt } from "@/types";

export function generateAlerts(debts: IDebt[]): DebtAlert[] {
  const alerts: DebtAlert[] = [];

  debts.forEach((d) => {
    if (d.interestRate >= 25) {
      alerts.push({
        type: "danger",
        message: `${d.name} has a very high APR of ${d.interestRate}% — prioritize paying this down.`,
      });
    }
    const monthlyInterest = (d.balance * d.interestRate) / 100 / 12;
    if (monthlyInterest > d.minPayment * 0.8) {
      alerts.push({
        type: "warning",
        message: `${d.name}: ₹${Math.round(monthlyInterest)}/mo of your minimum payment goes to interest — possible debt trap.`,
      });
    }
  });

  if (debts.length >= 5) {
    alerts.push({
      type: "info",
      message: `You have ${debts.length} active debts. Consolidation may reduce your total interest burden.`,
    });
  }

  return alerts;
}
