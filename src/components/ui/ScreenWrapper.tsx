import { motion } from "framer-motion";
import { useMemo } from "react";
import ClickSpark from "./ReactPits/Clic.kSpark.tsx";
import Threads from "./ReactPits/Threads.tsx";

export default function ScreenWrapper({ title, children }: any) {
  return (
    <div className="">
      {/* فقاعات خلفية متحركة */}
          
        <div style={{ width: '100%', height: '600px', position: 'absolute' }}>
          <Threads
            amplitude={1}
            distance={0}
            enableMouseInteraction={true}
          />
        </div>

      {/* المحتوى فوق الخلفية */}
      <div className="relative z-10">
        {title && (
            <h2 className="text-3xl md:text-4xl font-extrabold text-white font-Orbitron text-center">
            {title}
          </h2>
        )}
        <ClickSpark
          sparkColor='#22aa5560'
          sparkSize={10}
          sparkRadius={15}
          sparkCount={8}
          duration={400}
          >
          <div className="animate-fade-in text-white">
            {children}
          </div>
        </ClickSpark>
      </div>
    </div>
  );
}

function BackgroundBubbles() {
  const bubbles = useMemo(() => {
    return Array.from({ length: 25 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 16 + Math.random() * 24, // حجم متغير
      color: Math.random() > 0.5 ? "bg-purple-500/50" : "bg-blue-500/40",
      delay: Math.random() * 8,
      duration: 10 + Math.random() * 10,
      scale: 4.8 + Math.random() * 5.6,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble, i) => (
        <motion.span
          key={i}
          className={`absolute rounded-full ${bubble.color} blur-sm`}
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.left}%`,
            top: `${bubble.top}%`,
          }}
          animate={{
            y: [0, -20, 0, 20, 0],
            x: [0, 10, 0, -10, 0],
            scale: [2, bubble.scale, 1.5],
          }}
          transition={{
            repeat: Infinity,
            repeatType: "loop",
            duration: bubble.duration,
            ease: "easeInOut",
            delay: bubble.delay,
          }}
        />
      ))}
    </div>
  );
}