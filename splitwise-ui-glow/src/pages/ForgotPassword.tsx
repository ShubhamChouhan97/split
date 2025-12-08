import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate sending reset email
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    setIsSubmitted(true);
    
    toast({
      title: "Reset link sent!",
      description: "Check your email for a password reset link.",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        {/* Logo */}
        <div className="text-center">
          <div className="h-12 w-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-4">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold gradient-text">SplitEase</h1>
        </div>

        {!isSubmitted ? (
          <>
            <div className="text-center">
              <h2 className="text-3xl font-bold text-foreground">Forgot password?</h2>
              <p className="text-muted-foreground mt-2">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button type="submit" variant="gradient" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Sending...
                  </span>
                ) : (
                  "Send reset link"
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Check your email</h2>
            <p className="text-muted-foreground">
              We've sent a password reset link to{" "}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setIsSubmitted(false)}
            >
              Didn't receive the email? Try again
            </Button>
          </div>
        )}

        <div className="text-center">
          <Link to="/login" className="text-primary hover:underline inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
