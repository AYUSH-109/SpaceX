import { useNavigate } from "react-router-dom";
import { AuroraHero } from "@/components/ui/aurora-hero";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { SpiralAnimation } from "@/components/ui/spiral-animation";
import { Navbar } from "@/components/Navbar";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [user] = useState(null); // Will be connected to auth later

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={user} />
      
      <div className="relative min-h-screen">
        <div className="fixed inset-0 z-0">
          <SpiralAnimation />
        </div>
        
        <div className="relative z-10">
          <ShootingStars
            starColor="#FFFFFF"
            trailColor="#CCCCCC"
            minSpeed={15}
            maxSpeed={35}
            minDelay={1000}
            maxDelay={3000}
          />
          <ShootingStars
            starColor="#DDDDDD"
            trailColor="#AAAAAA"
            minSpeed={10}
            maxSpeed={25}
            minDelay={2000}
            maxDelay={4000}
          />
          
          <AuroraHero
            title="Interactive Lunar Map Explorer"
            subtitle="Navigate the lunar surface with precision. Annotate discoveries, bookmark locations, and download high-resolution images."
            buttonText="Start Exploring"
            onButtonClick={() => navigate("/viewer")}
          />
        </div>
      </div>
    </div>
  );
};

export default Index;
