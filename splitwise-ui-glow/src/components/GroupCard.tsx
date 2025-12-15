import { Link } from "react-router-dom";
import { Group, User } from "@/lib/api";
import { UserAvatar } from "./UserAvatar";
import { Users, ChevronRight } from "lucide-react";

interface GroupCardProps {
  group: Group;
}

export const GroupCard = ({ group }: GroupCardProps) => {
  const members = Array.isArray(group.members) ? group.members : [];

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
                {members.length} members
              </p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex -space-x-2">
            {members.slice(0, 4).map((member: string | User) => {
              const memberId = typeof member === "string" ? member : member.id;
              const userObject = typeof member === "string" ? { name: "User" } : member;

              return (
                <UserAvatar
                  key={memberId}
                  user={userObject}
                  size="sm"
                  className="ring-2 ring-card"
                />
              );
            })}

            {members.length > 4 && (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium ring-2 ring-card">
                +{members.length - 4}
              </div>
            )}
          </div>

          {group.totalExpenses !== undefined && group.totalExpenses > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total expenses</p>
              <p className="font-semibold text-foreground">
                ${Number(group.totalExpenses).toFixed(2)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};
