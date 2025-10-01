import { Stars } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useEffect } from "react";
import { FiArrowRight } from "react-icons/fi";
import {
  useMotionTemplate,
  useMotionValue,
  motion,
  animate,
} from "framer-motion";

const COLORS_TOP = ["#13FFAA", "#1E67C6", "#CE84CF", "#DD335C"];

export const AuroraHero = ({ title, subtitle, buttonText, onButtonClick }) => {
  const color = useMotionValue(COLORS_TOP[0]);

  useEffect(() => {
    animate(color, COLORS_TOP, {
      ease: "easeInOut",
      duration: 10,
      repeat: Infinity,
      repeatType: "mirror",
    });
  }, [color]);

  const backgroundImage = useMotionTemplate`radial-gradient(125% 125% at 50% 0%, #020617 50%, ${color})`;
  const border = useMotionTemplate`1px solid ${color}`;
  const boxShadow = useMotionTemplate`0px 4px 24px ${color}`;

  return (
    <motion.section
      style={{
        backgroundImage,
      }}
      className="relative grid min-h-screen place-content-center overflow-hidden bg-background px-4 py-24 text-foreground"
    >
      <div className="relative z-10 flex flex-col items-center">
        <span className="mb-1.5 inline-block rounded-full bg-muted/50 px-3 py-1.5 text-sm backdrop-blur-sm">
          Explore the Moon
        </span>
        <h1 className="max-w-3xl mt-8 bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-center text-3xl font-bold leading-tight text-transparent sm:text-5xl sm:leading-tight md:text-7xl md:leading-tight">
          {title || "Interactive Lunar Map Explorer"}
        </h1>
        <p className="my-6 max-w-xl text-center text-base leading-relaxed text-muted-foreground md:text-lg md:leading-relaxed">
          {subtitle || "Navigate the lunar surface with precision. Annotate discoveries, bookmark locations, and download high-resolution images."}
        </p>
        <motion.button
          style={{
            border,
            boxShadow,
          }}
          whileHover={{
            scale: 1.015,
          }}
          whileTap={{
            scale: 0.985,
          }}
          onClick={onButtonClick}
          className="group relative flex w-fit items-center gap-1.5 rounded-full bg-background/10 px-6 py-3 text-foreground transition-colors hover:bg-background/20 backdrop-blur-sm"
        >
          {buttonText || "Start Exploring"}
          <FiArrowRight className="transition-transform group-hover:-rotate-45 group-active:-rotate-12" />
        </motion.button>
      </div>

      <div className="absolute inset-0 z-0">
        <Canvas>
          <Stars radius={50} count={2500} factor={4} fade speed={2} />
        </Canvas>
      </div>
    </motion.section>
  );
};
