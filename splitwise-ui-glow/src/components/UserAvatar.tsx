import { cn } from "@/lib/utils";

interface UserAvatarProps {
  name: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const getInitials = (name: string): string => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

const getColorFromName = (name: string): string => {
  const colors = [
    "bg-primary",
    "bg-secondary",
    "bg-accent",
    "bg-success",
    "bg-warning",
  ];
  if (!name) return colors[0];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const UserAvatar = ({ name, size = "md", className }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full flex items-center justify-center font-medium text-primary-foreground shadow-sm",
        getColorFromName(name),
        sizeClasses[size],
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
};
