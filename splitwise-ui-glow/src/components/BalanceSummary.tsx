import { ArrowUpRight, ArrowDownRight, Wallet, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Balance } from "@/types/balance";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { UserAvatar } from "./UserAvatar";

interface BalanceSummaryProps {
  balances: Balance[];
}

export const BalanceSummary = ({ balances }: BalanceSummaryProps) => {
  const youOwe = balances.filter(b => b.amount < 0);
  const youAreOwed = balances.filter(b => b.amount > 0);

  const totalOwes = youOwe.reduce((acc, b) => acc + Math.abs(b.amount), 0);
  const totalOwed = youAreOwed.reduce((acc, b) => acc + b.amount, 0);
  const netBalance = totalOwed - totalOwes;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* You are owed */}
        <div className="hover-lift">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You are owed</p>
              <p className="text-2xl font-bold text-success">${totalOwed.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* You owe */}
        <div className="hover-lift">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">You owe</p>
              <p className="text-2xl font-bold text-destructive">${totalOwes.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Net Balance */}
        <div className="hover-lift">
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

      {(youOwe.length > 0 || youAreOwed.length > 0) && (
        <>
          <div className="border-t border-border my-4"></div>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-0">
              <AccordionTrigger>
                <div className="flex justify-center items-center w-full text-sm text-muted-foreground hover:text-primary">
                  View details <ChevronDown className="h-4 w-4 ml-1" />
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                  <div>
                    <h3 className="font-semibold mb-2 text-destructive">Who you owe</h3>
                    {youOwe.length > 0 ? (
                      <ul className="space-y-2">
                        {youOwe.map(balance => (
                          <li key={balance.user.id} className="flex items-center justify-between p-2 rounded-md bg-destructive/5">
                            <div className="flex items-center gap-2">
                              <UserAvatar user={balance.user} className="h-6 w-6" />
                              <span className="text-sm font-medium">{balance.user.name}</span>
                            </div>
                            <span className="text-sm font-bold text-destructive">${Math.abs(balance.amount).toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">You don't owe anyone.</p>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2 text-success">Who owes you</h3>
                    {youAreOwed.length > 0 ? (
                      <ul className="space-y-2">
                        {youAreOwed.map(balance => (
                          <li key={balance.user.id} className="flex items-center justify-between p-2 rounded-md bg-success/5">
                             <div className="flex items-center gap-2">
                              <UserAvatar user={balance.user} className="h-6 w-6" />
                              <span className="text-sm font-medium">{balance.user.name}</span>
                            </div>
                            <span className="text-sm font-bold text-success">${balance.amount.toFixed(2)}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-muted-foreground">No one owes you.</p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </>
      )}
    </div>
  );
};
