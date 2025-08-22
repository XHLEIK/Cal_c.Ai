
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calculator } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(onComplete, 500); // Wait for exit animation
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-calculator-bg z-50"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ 
          scale: isAnimating ? 1 : 1.1, 
          opacity: isAnimating ? 1 : 0 
        }}
        transition={{ 
          duration: isAnimating ? 0.5 : 0.3,
          ease: "easeOut"
        }}
        className="flex flex-col items-center"
      >
        <div className="relative">
          <Calculator size={64} className="text-calculator-primary" />
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ 
              scale: isAnimating ? [0, 1, 1] : 0, 
              opacity: isAnimating ? [0, 1, 0] : 0 
            }}
            transition={{ 
              duration: 1.5,
              times: [0, 0.4, 1],
              repeat: isAnimating ? Infinity : 0,
            }}
            className="absolute inset-0 rounded-full border-2 border-calculator-primary"
          />
        </div>
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: isAnimating ? 1 : 0, 
            y: isAnimating ? 0 : -10 
          }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-6 text-2xl font-bold text-white"
        >
          Dark Math Scholar
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: isAnimating ? 0.7 : 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-2 text-calculator-muted"
        >
          Advanced Calculator with AI
        </motion.p>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
