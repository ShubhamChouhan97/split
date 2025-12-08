import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, ArrowRight, Wallet, PieChart, Shield } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: Users,
      title: "Group Expenses",
      description: "Create groups for roommates, trips, or any shared expenses",
    },
    {
      icon: Wallet,
      title: "Easy Settlements",
      description: "See who owes what and settle up with a tap",
    },
    {
      icon: PieChart,
      title: "Clear Overview",
      description: "Track all your shared expenses in one place",
    },
    {
      icon: Shield,
      title: "Fair Splits",
      description: "Split expenses equally or customize amounts",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl gradient-bg flex items-center justify-center">
              <Users className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold gradient-text">SplitEase</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link to="/register">
              <Button variant="gradient">Sign up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
            Split expenses,{" "}
            <span className="gradient-text">not friendships</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            The easiest way to share expenses with friends, roommates, and travel buddies. 
            Track who paid, who owes, and settle up instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register">
              <Button variant="gradient" size="xl">
                Get started free
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="xl">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Preview */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 gradient-bg opacity-10 blur-3xl rounded-full" />
          <div className="relative bg-card rounded-2xl border border-border shadow-lg p-8 max-w-4xl mx-auto animate-fade-in" style={{ animationDelay: "200ms" }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold gradient-text">$0</div>
                <div className="text-sm text-muted-foreground">You owe</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-success">$245</div>
                <div className="text-sm text-muted-foreground">You are owed</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">4</div>
                <div className="text-sm text-muted-foreground">Active groups</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">12</div>
                <div className="text-sm text-muted-foreground">Friends</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Everything you need to split expenses
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Simple, fast, and fair expense sharing for any situation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-card rounded-xl border border-border p-6 hover-lift animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="gradient-bg rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to simplify your shared expenses?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of people who use SplitEase to keep their finances clear and friendships strong.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="xl" className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">
              Create your free account
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg gradient-bg flex items-center justify-center">
              <Users className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold gradient-text">SplitEase</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 SplitEase. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
