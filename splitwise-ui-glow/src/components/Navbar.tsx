import { Link, useLocation, useNavigate } from "react-router-dom";
import { UserAvatar } from "./UserAvatar";
import { Home, Users, Settings, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContexts";

export const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // assumes useAuth returns user and logout
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/groups", label: "Groups", icon: Users },
    // keep other main links here (Profile/Logout removed from top-level)
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
  try {
    await logout();           // context logout → clears user in React
  } catch (error) {
    console.error("Logout failed", error);
  }
};


  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">SplitEase</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {/* Desktop: avatar with hover/dropdown */}
            <div
              className="relative hidden md:block group"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <button
                className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring"
                aria-label="Open user menu"
                // note: not toggling JS; dropdown handled by hover/focus-within styles
              >
                {/* Use avatar props from user — if your UserAvatar expects src/name adapt accordingly */}
                <UserAvatar
                  user={user || { name: "User" }}
                  size="sm"
                />
              </button>

              {/* Dropdown: visible on group hover or focus-within */}
              <div
                className={cn(
                  "pointer-events-none opacity-0 scale-95 transform transition-all duration-150 absolute right-0 mt-2 w-40 origin-top-right rounded-md border bg-card p-2 shadow-lg",
                  "group-hover:pointer-events-auto group-hover:opacity-100 group-hover:scale-100",
                  "group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-focus-within:scale-100"
                )}
                role="menu"
                aria-orientation="vertical"
                aria-label="User menu"
              >
                <Link
                  to="/profile"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                  onClick={() => {
                    /* close not needed on desktop */
                  }}
                >
                  <UserIcon className="h-4 w-4" />
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm hover:bg-muted transition-colors"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300",
            mobileMenuOpen ? "max-h-72 pb-4" : "max-h-0"
          )}
        >
          <div className="flex flex-col gap-2 pt-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={isActive(item.path) ? "default" : "ghost"}
                  className="w-full justify-start gap-2"
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}

            {/* Mobile: Profile */}
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button variant={isActive("/profile") ? "default" : "ghost"} className="w-full justify-start gap-2">
                <UserIcon className="h-4 w-4" />
                Profile
              </Button>
            </Link>

            {/* Mobile: Logout */}
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="w-full text-left"
            >
              <Button variant="ghost" className="w-full justify-start gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
