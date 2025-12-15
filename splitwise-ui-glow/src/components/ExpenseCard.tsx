import { Expense, User } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContexts";
import { Receipt } from "lucide-react";

interface ExpenseCardProps {
  expense: Expense;
  members?: User[];
}

export const ExpenseCard = ({ expense, members = [] }: ExpenseCardProps) => {
  const { user } = useAuth();
  const currentUserId = user?.id || "";

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.id === userId);
    return member?.name || "Unknown";
  };

  const userSplit = (expense.splits || []).find((s) => s.userId === currentUserId);
  const isPayer = expense.paidBy === currentUserId;
  const userOwes = userSplit && !isPayer ? Number(userSplit.amount ?? 0) : 0;
  const userIsOwed = isPayer ? Number(expense.amount ?? 0) - Number(userSplit?.amount ?? 0) : 0;

  return (
    <div className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h4 className="font-medium text-foreground truncate">{expense.description}</h4>
              <p className="text-sm text-muted-foreground">
                Paid by {expense.paidByName}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-semibold text-foreground">${Number(expense.amount ?? 0).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(expense.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-border">
            {userOwes > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">You owe </span>
                <span className="font-medium text-destructive">${userOwes.toFixed(2)}</span>
              </p>
            )}
            {userIsOwed > 0 && (
              <p className="text-sm">
                <span className="text-muted-foreground">You are owed </span>
                <span className="font-medium text-success">${userIsOwed.toFixed(2)}</span>
              </p>
            )}
            {userOwes === 0 && userIsOwed === 0 && (
              <p className="text-sm text-muted-foreground">Not involved</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
