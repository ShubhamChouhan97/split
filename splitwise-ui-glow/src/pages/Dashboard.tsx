import { useState, useEffect, useCallback } from "react";
import { Navbar } from "@/components/Navbar";
import { GroupCard } from "@/components/GroupCard";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ActivityFeed } from "@/components/ActivityFeed";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { Button } from "@/components/ui/button";
import { Plus, Users, TrendingUp, Loader2 } from "lucide-react";
import { groupsApi, Group, Debt } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { Balance } from "@/types/balance";
import { useAuth } from "@/contexts/AuthContexts";

const Dashboard = () => {
  const { user } = useAuth();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const initialGroups = await groupsApi.getAll();
      
      const detailedGroups = await Promise.all(
        initialGroups.map(group => groupsApi.getById(group.id))
      );

      const allDebts: (Debt & { group: Group })[] = detailedGroups.flatMap(group => 
        (group.debts || []).map(debt => ({ ...debt, group }))
      );
      
      const userBalances: { [key: string]: { user: any, amount: number } } = {};

      for (const debt of allDebts) {
        const groupForDebt = detailedGroups.find(g => g.id === debt.group.id);
        if (!groupForDebt) continue;

        if (debt.from === user.id) { // Current user owes money
          const otherUser = groupForDebt.members.find(m => m.id === debt.to);
          if (otherUser) {
            if (!userBalances[otherUser.id]) {
              userBalances[otherUser.id] = { user: otherUser, amount: 0 };
            }
            userBalances[otherUser.id].amount -= debt.amount;
          }
        } else if (debt.to === user.id) { // Money is owed to the current user
          const otherUser = groupForDebt.members.find(m => m.id === debt.from);
          if (otherUser) {
            if (!userBalances[otherUser.id]) {
              userBalances[otherUser.id] = { user: otherUser, amount: 0 };
            }
            userBalances[otherUser.id].amount += debt.amount;
          }
        }
      }
      
      setGroups(initialGroups);
      setBalances(Object.values(userBalances).filter(b => b.amount !== 0));

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleCreateGroup = async (name: string, memberIds: string[]) => {
    try {
      const newGroup = await groupsApi.create({ name, members: memberIds });
      setGroups([newGroup, ...groups]);
      toast({
        title: "Group created!",
        description: `"${name}" has been created successfully.`,
      });
      // Refetch data to update balances
      fetchDashboardData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create group",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name?.split(" ")[0]}!
            </p>
          </div>
          <Button variant="gradient" onClick={() => setShowCreateGroup(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Balance Summary */}
        <section className="mb-8">
          <BalanceSummary balances={balances} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Your Groups</h2>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : groups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group, index) => (
                  <div
                    key={group.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <GroupCard group={group} />
                  </div>
                ))}
              </div>
            ) : (
              !loading && <div className="bg-card rounded-xl border border-border p-8 text-center">
                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-foreground mb-2">No groups yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first group to start splitting expenses
                </p>
                <Button variant="outline" onClick={() => setShowCreateGroup(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Group
                </Button>
              </div>
            )}
          </div>

          {/* Activity Feed */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Recent Activity</h2>
            </div>
            
            <div className="bg-card rounded-xl border border-border p-4">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </main>

      <CreateGroupModal
        open={showCreateGroup}
        onOpenChange={setShowCreateGroup}
        onCreate={handleCreateGroup}
      />
    </div>
  );
};

export default Dashboard;
