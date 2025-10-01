import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { StardustButton } from "@/components/ui/stardust-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // This will be connected to Lovable Cloud authentication
    toast.success(isLogin ? "Logged in successfully!" : "Account created!");
    navigate("/viewer");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ShootingStars starColor="#9E00FF" trailColor="#2EB9DF" />
      
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-16 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-8 backdrop-blur-sm">
            <h2 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {isLogin ? "Welcome Back" : "Join LunarScope"}
            </h2>
            <p className="text-muted-foreground text-center mb-8">
              {isLogin ? "Sign in to continue exploring" : "Create an account to start exploring"}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-background/50"
                />
              </div>

              <div className="flex justify-center">
                <StardustButton type="submit">
                  {isLogin ? "Sign In" : "Create Account"}
                </StardustButton>
              </div>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-xs text-muted-foreground text-center mb-4">Or continue with</p>
              <button className="w-full flex items-center justify-center gap-2 bg-background/50 hover:bg-background border border-border rounded-lg py-3 transition-colors">
                <Mail className="h-5 w-5" />
                <span>Google</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
