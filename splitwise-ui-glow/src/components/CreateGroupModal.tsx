import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { User, users, currentUser } from "@/data/mockData";
import { Users, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (name: string, members: User[]) => void;
}

export const CreateGroupModal = ({ open, onOpenChange, onCreate }: CreateGroupModalProps) => {
  const [name, setName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([currentUser.id]);

  const availableUsers = users.filter((u) => u.id !== currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Missing name",
        description: "Please enter a group name",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.length < 2) {
      toast({
        title: "Not enough members",
        description: "Please select at least one other member",
        variant: "destructive",
      });
      return;
    }

    const members = users.filter((u) => selectedMembers.includes(u.id));
    onCreate(name, members);

    setName("");
    setSelectedMembers([currentUser.id]);
    onOpenChange(false);

    toast({
      title: "Group created!",
      description: `"${name}" has been created with ${members.length} members.`,
    });
  };

  const toggleMember = (memberId: string) => {
    if (memberId === currentUser.id) return;
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
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
            <Label>Members</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-muted/50 rounded-lg">
              {/* Current user (always selected) */}
              <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg">
                <Checkbox checked disabled />
                <label className="text-sm flex-1">
                  {currentUser.name} <span className="text-muted-foreground">(you)</span>
                </label>
              </div>
              
              {availableUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedMembers.includes(user.id)}
                    onCheckedChange={() => toggleMember(user.id)}
                  />
                  <label
                    htmlFor={`user-${user.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {user.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              <Plus className="h-4 w-4 mr-1" />
              Create Group
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
