import { AlertTriangle, Info } from "lucide-react";

import type { DebtAlert } from "@/types";

const styles: Record<DebtAlert["type"], string> = {
  danger: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
  warning: "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
  info: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
};

export default function AlertBanner({ alert }: { alert: DebtAlert }) {
  const Icon = alert.type === "info" ? Info : AlertTriangle;
  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 ${styles[alert.type]}`}>
      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
      <p className="text-sm">{alert.message}</p>
    </div>
  );
}
