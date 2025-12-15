import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Users, Edit2, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContexts";

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");

  // Keep state in sync if the user object from context changes
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // TODO: In the future, you'll fetch group details based on the IDs in `user.groups`
  const userGroups: any[] = []; // Placeholder for now

  const handleSave = () => {
    // TODO: Implement API call to update user profile
    // For now, we just update the UI state
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your changes have been saved.",
    });
  };

  const handleCancel = () => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    setIsEditing(false);
  };

  if (!user) {
    return null; // Or a loading spinner, though ProtectedRoute should prevent this
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Profile Header */}
        <div className="bg-card rounded-xl border border-border p-8 mb-8 animate-fade-in">
          <div className="flex flex-col items-center text-center">
            <UserAvatar user={{ name: name, avatar: user.avatar }} size="lg" className="h-20 w-20 text-2xl mb-4" />
            <h1 className="text-2xl font-bold text-foreground">{name}</h1>
            <p className="text-muted-foreground">{email}</p>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-foreground">Profile Details</h2>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button variant="default" size="sm" onClick={handleSave}>
                  <Check className="h-4 w-4 mr-1" />
                  Save
                </Button>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profile-name">Full name</Label>
              {isEditing ? (
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{name}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="profile-email">Email address</Label>
              {isEditing ? (
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{email}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* User Groups */}
        <div className="bg-card rounded-xl border border-border p-6 animate-fade-in" style={{ animationDelay: "200ms" }}>
          <div className="flex items-center gap-2 mb-6">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Your Groups</h2>
          </div>

          {userGroups.length > 0 ? (
            <div className="space-y-3">
              {userGroups.map((group) => (
                <Link
                  key={group.id}
                  to={`/group/${group.id}`}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{group.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {group.members.length} members
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-4">
              You haven't joined any groups yet
            </p>
          )}
        </div>

        {/* Danger Zone */}
        <div className="mt-8 p-6 border border-destructive/20 rounded-xl animate-fade-in" style={{ animationDelay: "300ms" }}>
          <h3 className="text-lg font-semibold text-destructive mb-2">Danger Zone</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button variant="destructive" size="sm">
            Delete Account
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Profile;
