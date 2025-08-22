import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface CalculatorKeyProps {
  label: string;
  onClick: () => void;
  className?: string;
  isExpanded?: boolean;
}

const CalculatorKey = ({ label, onClick, className = "calculator-button", isExpanded = false }: CalculatorKeyProps) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const handleClick = () => {
    setIsPressed(true);
    onClick();
  };
  
  // Reset the pressed state after a short delay
  useEffect(() => {
    if (isPressed) {
      const timer = setTimeout(() => {
        setIsPressed(false);
      }, 100); // Shorter duration for quicker return to normal
      
      return () => clearTimeout(timer);
    }
  }, [isPressed]);
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleClick}
      className={`${className} ${isExpanded ? 'col-span-2' : ''} calculator-key ${isPressed ? 'calculator-key-pressed' : ''}`}
    >
      {label}
    </motion.button>
  );
};

export default CalculatorKey;
