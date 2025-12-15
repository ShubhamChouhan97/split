import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContexts";
import { Users, Plus, UserPlus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, memberIds: string[]) => void;
}

export const CreateGroupModal = ({ open, onOpenChange, onCreate }: CreateGroupModalProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
 const [memberEmails, setMemberEmails] = useState<string[]>(
  user?.email ? [user.email.toLowerCase()] : []
);
  const [newEmail, setNewEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddEmail = () => {
  const email = newEmail.trim().toLowerCase();
  if (!email) return;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast({
      title: "Invalid email",
      description: "Please enter a valid email address",
      variant: "destructive",
    });
    return;
  }

  if (memberEmails.includes(email)) {
    toast({
      title: "Already added",
      description: "This email is already in the list",
      variant: "destructive",
    });
    return;
  }

  setMemberEmails([...memberEmails, email]);
  setNewEmail("");
};


  const handleRemoveEmail = (email: string) => {
    setMemberEmails(memberEmails.filter((e) => e !== email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Pass member emails - backend will resolve them to user IDs
      onCreate(name, memberEmails);
      setName("");
      setMemberEmails([]);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            Create New Group
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="group-name">Group Name</Label>
            <Input
              id="group-name"
              placeholder="e.g., Weekend Trip, Apartment"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Invite Members by Email</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <Button type="button" variant="outline" onClick={handleAddEmail}>
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Members</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-muted/50 rounded-lg">
              {memberEmails.map((email) => (
                <div key={email} className="flex items-center justify-between gap-2 p-2 bg-muted rounded-lg">
                  <span className="text-sm truncate">{email}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveEmail(email)}
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                  >
                    ×
                  </Button>
                </div>
              ))}

              {memberEmails.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  Add members by entering their email addresses above
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1" disabled={isSubmitting}>
              <Plus className="h-4 w-4 mr-1" />
              {isSubmitting ? "Creating..." : "Create Group"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
