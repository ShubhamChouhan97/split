import { recentActivity } from "@/data/mockData";
import { Receipt, Handshake, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "expense":
      return Receipt;
    case "settle":
      return Handshake;
    case "group":
      return Users;
    default:
      return Clock;
  }
};

const getActivityColor = (type: string) => {
  switch (type) {
    case "expense":
      return "bg-primary/10 text-primary";
    case "settle":
      return "bg-success/10 text-success";
    case "group":
      return "bg-secondary/10 text-secondary";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const ActivityFeed = () => {
  return (
    <div className="space-y-3">
      {recentActivity.map((activity, index) => {
        const Icon = getActivityIcon(activity.type);
        const colorClass = getActivityColor(activity.type);
        
        return (
          <div
            key={activity.id}
            className="flex items-start gap-3 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0", colorClass)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{activity.description}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
