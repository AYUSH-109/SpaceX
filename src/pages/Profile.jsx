import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Camera, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setUsername(userData.username || "");
      setEmail(userData.email || "");
      setPhotoUrl(userData.photoUrl || "");
    } else {
      navigate("/auth");
    }
  }, [navigate]);

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    
    const updatedUser = {
      ...user,
      username,
      email,
      photoUrl
    };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success("Logged out successfully!");
    navigate("/auth");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <ShootingStars starColor="#9E00FF" trailColor="#2EB9DF" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card className="border-border backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Profile Settings
            </CardTitle>
            <CardDescription>
              Manage your account information and preferences
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={photoUrl} alt={username} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                    {username ? username[0].toUpperCase() : <User className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>
                <button
                  className="absolute bottom-0 right-0 p-2 bg-primary rounded-full hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    const newUrl = prompt("Enter photo URL:");
                    if (newUrl) setPhotoUrl(newUrl);
                  }}
                >
                  <Camera className="h-4 w-4 text-primary-foreground" />
                </button>
              </div>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">
                  Save Changes
                </Button>
                <Button 
                  type="button" 
                  variant="destructive" 
                  onClick={handleLogout}
                  className="flex-1"
                >
                  Logout
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
