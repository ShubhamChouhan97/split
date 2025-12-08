import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Balance, getUserById } from "@/data/mockData";
import { UserAvatar } from "./UserAvatar";
import { ArrowRight, DollarSign, Handshake } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SettleUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balances: Balance[];
  members: User[];
  currentUserId: string;
  onSettle: (payerId: string, receiverId: string, amount: number) => void;
}

export const SettleUpModal = ({
  open,
  onOpenChange,
  balances,
  members,
  currentUserId,
  onSettle,
}: SettleUpModalProps) => {
  const [selectedPayer, setSelectedPayer] = useState("");
  const [selectedReceiver, setSelectedReceiver] = useState("");
  const [amount, setAmount] = useState("");

  const debtors = balances.filter((b) => b.amount < 0);
  const creditors = balances.filter((b) => b.amount > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPayer || !selectedReceiver || !amount) {
      toast({
        title: "Missing fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    onSettle(selectedPayer, selectedReceiver, parseFloat(amount));
    
    setSelectedPayer("");
    setSelectedReceiver("");
    setAmount("");
    onOpenChange(false);

    toast({
      title: "Settlement recorded!",
      description: `Payment of $${amount} has been recorded.`,
    });
  };

  const getSuggestedAmount = () => {
    if (!selectedPayer || !selectedReceiver) return null;
    const payerBalance = balances.find((b) => b.userId === selectedPayer);
    const receiverBalance = balances.find((b) => b.userId === selectedReceiver);
    if (payerBalance && receiverBalance) {
      return Math.min(Math.abs(payerBalance.amount), Math.abs(receiverBalance.amount));
    }
    return null;
  };

  const suggestedAmount = getSuggestedAmount();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Handshake className="h-4 w-4 text-success" />
            </div>
            Settle Up
          </DialogTitle>
        </DialogHeader>

        {/* Balance Overview */}
        <div className="space-y-3 py-4">
          <p className="text-sm font-medium text-muted-foreground">Current Balances</p>
          <div className="space-y-2">
            {balances.map((balance) => {
              const user = getUserById(balance.userId);
              if (!user || balance.amount === 0) return null;
              return (
                <div
                  key={balance.userId}
                  className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <UserAvatar name={user.name} size="sm" />
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <span
                    className={cn(
                      "font-medium",
                      balance.amount > 0 ? "text-success" : "text-destructive"
                    )}
                  >
                    {balance.amount > 0 ? "+" : ""}${balance.amount.toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <Label>From</Label>
              <Select value={selectedPayer} onValueChange={setSelectedPayer}>
                <SelectTrigger>
                  <SelectValue placeholder="Who's paying?" />
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

            <ArrowRight className="h-5 w-5 text-muted-foreground mt-6" />

            <div className="flex-1 space-y-2">
              <Label>To</Label>
              <Select value={selectedReceiver} onValueChange={setSelectedReceiver}>
                <SelectTrigger>
                  <SelectValue placeholder="Who's receiving?" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter((m) => m.id !== selectedPayer)
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="settle-amount">Amount</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="settle-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
              />
            </div>
            {suggestedAmount && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-xs text-primary"
                onClick={() => setAmount(suggestedAmount.toFixed(2))}
              >
                Use suggested: ${suggestedAmount.toFixed(2)}
              </Button>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="success" className="flex-1">
              Record Payment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
