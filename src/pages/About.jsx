import { ShootingStars } from "@/components/ui/shooting-stars";
import { Telescope, MapPin, Download, Bookmark } from "lucide-react";

const About = () => {
  const features = [
    {
      icon: Telescope,
      title: "High-Resolution Lunar Maps",
      description: "Explore detailed, high-resolution images of the lunar surface with smooth zoom and pan capabilities."
    },
    {
      icon: MapPin,
      title: "Annotation Tools",
      description: "Draw rectangles and add notes to mark interesting features, craters, and discoveries on the lunar surface."
    },
    {
      icon: Bookmark,
      title: "Bookmark Views",
      description: "Save your favorite views with precise coordinates and zoom levels to return to them anytime."
    },
    {
      icon: Download,
      title: "Download Selections",
      description: "Export high-resolution screenshots of specific sections of the lunar map for research or personal use."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <ShootingStars
        starColor="#9E00FF"
        trailColor="#2EB9DF"
        minSpeed={15}
        maxSpeed={35}
      />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            About LunarScope
          </h1>
          <p className="text-lg text-muted-foreground text-center mb-16">
            Our mission is to make lunar exploration accessible to everyone. Whether you're a researcher, 
            educator, or space enthusiast, LunarScope provides powerful tools to explore and study the Moon.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
              >
                <feature.icon className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-card border border-border rounded-lg p-8 text-left">
            <h2 className="text-2xl font-bold mb-4 text-left">Technology</h2>
            <p className="text-muted-foreground mb-4 text-left leading-relaxed">
              LunarScope uses OpenSeadragon for smooth, high-performance image viewing. 
              Our tiled image system ensures fast loading times even for massive lunar map datasets.
            </p>
            <p className="text-muted-foreground text-left leading-relaxed">
              Built with modern web technologies including React, Framer Motion for smooth animations, 
              and Three.js for immersive visual effects.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
