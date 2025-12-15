import { useState, useEffect } from "react";
import { Receipt, Handshake, Users, Clock, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { activityApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
}

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
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const recentActivities = await activityApi.getRecent();
        setActivities(recentActivities);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load recent activity.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => {
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
              <p className="text-xs text-muted-foreground">{new Date(activity.time).toLocaleString()}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
