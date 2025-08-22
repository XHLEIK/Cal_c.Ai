
import { motion } from "framer-motion";

interface CalculatorDisplayProps {
  expression: string;
  result: string;
  history: string[];
  showHistory: boolean;
}

const CalculatorDisplay = ({
  expression,
  result,
  history,
  showHistory
}: CalculatorDisplayProps) => {
  return (
    <div className="calculator-display p-4 rounded-t-xl mb-0 min-h-[140px] bg-gradient-to-b from-calculator-bg/90 to-calculator-bg">
      <div className="h-full flex flex-col justify-end">
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{
            height: showHistory ? 'auto' : 0,
            opacity: showHistory ? 1 : 0,
          }}
          className="overflow-hidden mb-2"
        >
          {showHistory && (
            <div className="text-calculator-muted text-sm text-right max-h-[80px] overflow-y-auto scrollbar-none">
              {history.map((item, index) => (
                <div key={index} className="py-1 border-b border-white/5 last:border-0">{item}</div>
              ))}
            </div>
          )}
        </motion.div>
        <div className="text-calculator-muted text-right text-xl overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          {expression || "0"}
        </div>
        <div className="text-calculator-text text-right text-4xl font-semibold overflow-x-auto whitespace-nowrap scrollbar-none py-1">
          {result || "0"}
        </div>
      </div>
    </div>
  );
};

export default CalculatorDisplay;
