import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from "@/data/mockData";
import { Receipt, DollarSign } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: User[];
  onAdd: (expense: { description: string; amount: number; paidBy: string; splitBetween: string[] }) => void;
}

export const AddExpenseModal = ({ open, onOpenChange, members, onAdd }: AddExpenseModalProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [splitBetween, setSplitBetween] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description || !amount || !paidBy || splitBetween.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onAdd({
      description,
      amount: parseFloat(amount),
      paidBy,
      splitBetween,
    });

    setDescription("");
    setAmount("");
    setPaidBy("");
    setSplitBetween([]);
    onOpenChange(false);

    toast({
      title: "Expense added!",
      description: `$${amount} for "${description}" has been recorded.`,
    });
  };

  const toggleMember = (memberId: string) => {
    setSplitBetween((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const selectAllMembers = () => {
    setSplitBetween(members.map((m) => m.id));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-primary" />
            </div>
            Add Expense
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paidBy">Paid by</Label>
            <Select value={paidBy} onValueChange={setPaidBy}>
              <SelectTrigger>
                <SelectValue placeholder="Who paid?" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Split between</Label>
              <Button type="button" variant="ghost" size="sm" onClick={selectAllMembers}>
                Select all
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-muted/50 rounded-lg">
              {members.map((member) => (
                <div key={member.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`member-${member.id}`}
                    checked={splitBetween.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                  <label
                    htmlFor={`member-${member.id}`}
                    className="text-sm cursor-pointer flex-1"
                  >
                    {member.name}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {splitBetween.length > 0 && amount && (
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Each person pays:{" "}
                <span className="font-semibold text-foreground">
                  ${(parseFloat(amount) / splitBetween.length).toFixed(2)}
                </span>
              </p>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" className="flex-1">
              Add Expense
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
