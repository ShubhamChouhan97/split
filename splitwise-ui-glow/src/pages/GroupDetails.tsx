import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ExpenseCard } from "@/components/ExpenseCard";
import { AddExpenseModal } from "@/components/AddExpenseModal";
import { SettleUpModal } from "@/components/SettleUpModal";
import { UserAvatar } from "@/components/UserAvatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { groupsApi, expensesApi, settlementsApi, Group, Expense, Balance, Debt } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContexts";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Plus,
  Handshake,
  Receipt,
  Scale,
  Clock,
  Users,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const GroupDetails = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);

  const fetchGroupData = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const [groupData, expensesData] = await Promise.all([
        groupsApi.getById(id),
        expensesApi.getByGroupId(id),
      ]);
      setGroup(groupData);
      setExpenses(expensesData);
      setBalances(groupData.balances || []);
      setDebts(groupData.debts || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load group data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Group not found</h1>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddExpense = async (expense: {
    description: string;
    amount: number;
    paidBy: string;
    splitBetween: string[];
  }) => {
    try {
      const splits = expense.splitBetween.map((userId) => ({
        userId,
        amount: expense.amount / expense.splitBetween.length,
      }));

      await expensesApi.create({
        groupId: group.id,
        description: expense.description,
        amount: expense.amount,
        paidBy: expense.paidBy,
        splits,
      });

      setShowAddExpense(false);
      // Refresh all data to update expenses, balances, and group totals
      await fetchGroupData();

      toast({
        title: "Expense added!",
        description: `$${expense.amount} for "${expense.description}" has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add expense",
        variant: "destructive",
      });
    }
  };

  const handleSettle = async (payerId: string, receiverId: string, amount: number) => {
    try {
      await settlementsApi.create({
        groupId: group.id,
        payerId,
        receiverId,
        amount,
      });

      // Refresh all data to update balances
      await fetchGroupData();

      toast({
        title: "Settlement recorded!",
        description: `Payment of $${amount} has been recorded.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record settlement",
        variant: "destructive",
      });
    }
  };

  const getMemberName = (userId: string) => {
    const member = group.members.find((m) => m.id === userId);
    return member?.name || "Unknown";
  };

  const activityLog = expenses.map((e) => ({
    id: e.id,
    description: `${getMemberName(e.paidBy)} added "${e.description}"`,
    amount: Number(e.amount ?? 0),
    date: e.createdAt,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link to="/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Group Header */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl gradient-bg flex items-center justify-center">
                <Users className="h-7 w-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{group.name}</h1>
                <p className="text-muted-foreground">{group.members.length} members</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowSettleUp(true)}>
                <Handshake className="h-4 w-4 mr-2" />
                Settle Up
              </Button>
              <Button variant="gradient" onClick={() => setShowAddExpense(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </div>
          </div>

          {/* Members */}
          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Members</p>
            <div className="flex flex-wrap gap-3">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center gap-2 bg-muted/50 rounded-full pl-1 pr-3 py-1">
                  <UserAvatar user={member} size="sm" />
                  <span className="text-sm">{member.name || member.id}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="expenses" className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="expenses" className="gap-2">
              <Receipt className="h-4 w-4" />
              <span className="hidden sm:inline">Expenses</span>
            </TabsTrigger>
            <TabsTrigger value="balances" className="gap-2">
              <Scale className="h-4 w-4" />
              <span className="hidden sm:inline">Balances</span>
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Clock className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
            </TabsTrigger>
          </TabsList>

          {/* Expenses Tab */}
          <TabsContent value="expenses" className="space-y-4">
            {expenses.length > 0 ? (
              expenses.map((expense, index) => (
                <div key={expense.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <ExpenseCard expense={expense} members={group.members} />
                </div>
              ))
            ) : (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">No expenses yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add your first expense to start tracking
                </p>
                <Button variant="outline" onClick={() => setShowAddExpense(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            )}
          </TabsContent>

          {/* Balances Tab */}
          <TabsContent value="balances">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Who owes what</h3>
              <div className="space-y-3">
                {debts.length > 0 ? (
                  debts.map((debt, index) => {
                    const fromUser = group.members.find((m) => m.id === debt.from);
                    const toUser = group.members.find((m) => m.id === debt.to);
                    
                    if (!fromUser || !toUser) return null;

                    return (
                      <div
                        key={`${debt.from}-${debt.to}-${index}`}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar user={fromUser} size="sm" />
                          <span className="font-medium">
                            {fromUser.name}
                            {user?.id === fromUser.id && <span className="text-muted-foreground"> (you)</span>}
                          </span>
                          <span className="text-muted-foreground text-sm">owes</span>
                          <UserAvatar user={toUser} size="sm" />
                          <span className="font-medium">
                            {toUser.name}
                            {user?.id === toUser.id && <span className="text-muted-foreground"> (you)</span>}
                          </span>
                        </div>
                        <span className="font-semibold text-destructive">
                          ${debt.amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-muted-foreground py-4">Everything is settled up!</p>
                )}
              </div>

              {balances.some((b) => b.amount !== 0) && (
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={() => setShowSettleUp(true)}
                >
                  <Handshake className="h-4 w-4 mr-2" />
                  Settle Up
                </Button>
              )}
            </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">Activity Log</h3>
              {activityLog.length > 0 ? (
                <div className="space-y-3">
                  {activityLog.map((activity, index) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 border-b border-border last:border-0 animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div>
                        <p className="text-sm text-foreground">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="font-medium text-foreground">
                        ${activity.amount.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-4">No activity yet</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <AddExpenseModal
        open={showAddExpense}
        onOpenChange={setShowAddExpense}
        members={group.members}
        onAdd={handleAddExpense}
      />

      <SettleUpModal
        open={showSettleUp}
        onOpenChange={setShowSettleUp}
        balances={balances}
        members={group.members}
        currentUserId={user?.id || ""}
        onSettle={handleSettle}
      />
    </div>
  );
};

export default GroupDetails;
