import { Link } from "react-router-dom";
import { Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const Navbar = ({ user, onLogout }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold">
          <Moon className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            LunarScope
          </span>
        </Link>

        <div className="flex items-center gap-4">
          <Link to="/about">
            <Button variant="ghost" className="text-foreground hover:text-primary">
              About Us
            </Button>
          </Link>
          
          {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowProfile(!showProfile)}
                className="rounded-full"
              >
                <User className="h-5 w-5" />
              </Button>
              
              {showProfile && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg py-2">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium">{user.email}</p>
                  </div>
                  <button className="w-full text-left px-4 py-2 hover:bg-muted text-sm">
                    Change Username
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-muted text-sm">
                    Update Photo
                  </button>
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 hover:bg-muted text-sm text-destructive"
                  >
                    Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/auth">
              <Button className="bg-primary hover:bg-primary/90">
                Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
