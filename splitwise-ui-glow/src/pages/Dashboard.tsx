import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { GroupCard } from "@/components/GroupCard";
import { BalanceSummary } from "@/components/BalanceSummary";
import { ActivityFeed } from "@/components/ActivityFeed";
import { CreateGroupModal } from "@/components/CreateGroupModal";
import { Button } from "@/components/ui/button";
import { groups, getTotalBalance, User } from "@/data/mockData";
import { Plus, Users, TrendingUp } from "lucide-react";

const Dashboard = () => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [localGroups, setLocalGroups] = useState(groups);
  const { owed, owes } = getTotalBalance();

  const handleCreateGroup = (name: string, members: User[]) => {
    const newGroup = {
      id: `g${localGroups.length + 1}`,
      name,
      members,
      totalExpenses: 0,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setLocalGroups([newGroup, ...localGroups]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Track your shared expenses</p>
          </div>
          <Button variant="gradient" onClick={() => setShowCreateGroup(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>

        {/* Balance Summary */}
        <section className="mb-8">
          <BalanceSummary owed={owed} owes={owes} />
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Groups List */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold text-foreground">Your Groups</h2>
            </div>
            
            {localGroups.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {localGroups.map((group, index) => (
                  <div key={group.id} className="animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                    <GroupCard group={group} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-card rounded-xl border border-border p-8 text-center">
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
