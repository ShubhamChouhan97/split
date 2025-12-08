import { Link } from "react-router-dom";
import { Group, calculateBalances, currentUser } from "@/data/mockData";
import { UserAvatar } from "./UserAvatar";
import { Users, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const balances = calculateBalances(group.id);
  const userBalance = balances.find((b) => b.userId === currentUser.id);
  const balance = userBalance?.amount || 0;

  return (
    <Link to={`/group/${group.id}`}>
      <div className="group bg-card rounded-xl border border-border p-4 hover-lift cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {group.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {group.members.length} members
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {group.members.slice(0, 4).map((member) => (
              <UserAvatar key={member.id} name={member.name} size="sm" className="ring-2 ring-card" />
            ))}
            {group.members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-card">
                +{group.members.length - 4}
              </div>
            )}
          </div>

          <div className="text-right">
            <p className="text-xs text-muted-foreground">Your balance</p>
            <p
              className={cn(
                "font-semibold",
                balance > 0 ? "text-success" : balance < 0 ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {balance > 0 ? "+" : ""}${Math.abs(balance).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
};
