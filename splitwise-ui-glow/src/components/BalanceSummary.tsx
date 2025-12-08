import { ArrowUpRight, ArrowDownRight, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceSummaryProps {
  owed: number;
  owes: number;
}

export const BalanceSummary = ({ owed, owes }: BalanceSummaryProps) => {
  const netBalance = owed - owes;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* You are owed */}
      <div className="bg-card rounded-xl border border-border p-5 hover-lift">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
            <ArrowDownRight className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">You are owed</p>
            <p className="text-2xl font-bold text-success">${owed.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* You owe */}
      <div className="bg-card rounded-xl border border-border p-5 hover-lift">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
            <ArrowUpRight className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">You owe</p>
            <p className="text-2xl font-bold text-destructive">${owes.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Net Balance */}
      <div className="bg-card rounded-xl border border-border p-5 hover-lift">
        <div className="flex items-center gap-3">
          <div className={cn(
            "h-10 w-10 rounded-lg flex items-center justify-center",
            netBalance >= 0 ? "bg-primary/10" : "bg-warning/10"
          )}>
            <Wallet className={cn(
              "h-5 w-5",
              netBalance >= 0 ? "text-primary" : "text-warning"
            )} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Net balance</p>
            <p className={cn(
              "text-2xl font-bold",
              netBalance >= 0 ? "text-primary" : "text-warning"
            )}>
              {netBalance >= 0 ? "+" : ""}${netBalance.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
