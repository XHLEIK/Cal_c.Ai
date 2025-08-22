
import { motion } from "framer-motion";

interface CalculatorKeyProps {
  label: string;
  onClick: () => void;
  className?: string;
  isExpanded?: boolean;
}

const CalculatorKey = ({ label, onClick, className = "calculator-button", isExpanded = false }: CalculatorKeyProps) => {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${className} ${isExpanded ? 'col-span-2' : ''} calculator-key`}
    >
      {label}
    </motion.button>
  );
};

interface CalculatorKeypadProps {
  onNumberClick: (num: string) => void;
  onOperatorClick: (op: string) => void;
  onClear: () => void;
  onCalculate: () => void;
  onDecimal: () => void;
  onDelete: () => void;
  scientificMode: boolean;
  onScientificFunction: (func: string) => void;
  onToggleScientificMode: () => void;
}

const CalculatorKeypad = ({
  onNumberClick,
  onOperatorClick,
  onClear,
  onCalculate,
  onDecimal,
  onDelete,
  scientificMode,
  onScientificFunction,
  onToggleScientificMode
}: CalculatorKeypadProps) => {
  return (
    <div className="calculator-keypad p-4 glass-morphism rounded-xl flex-1 flex flex-col mt-0">
      <div className="flex justify-end mb-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleScientificMode}
          className={`p-2 flex items-center gap-1 ${scientificMode ? "text-calculator-primary" : "text-calculator-secondary"}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 12H4"></path>
            <path d={scientificMode ? "M4 6h16" : "M4 18h16"}></path>
          </svg>
          {scientificMode ? "Standard" : "Scientific"}
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: scientificMode ? 1 : 0,
          height: scientificMode ? 'auto' : 0
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="grid grid-cols-4 gap-2 mb-4">
          <CalculatorKey label="sin" onClick={() => onScientificFunction('sin')} className="calculator-button-function" />
          <CalculatorKey label="cos" onClick={() => onScientificFunction('cos')} className="calculator-button-function" />
          <CalculatorKey label="tan" onClick={() => onScientificFunction('tan')} className="calculator-button-function" />
          <CalculatorKey label="π" onClick={() => onScientificFunction('π')} className="calculator-button-function" />

          <CalculatorKey label="log" onClick={() => onScientificFunction('log')} className="calculator-button-function" />
          <CalculatorKey label="ln" onClick={() => onScientificFunction('ln')} className="calculator-button-function" />
          <CalculatorKey label="e" onClick={() => onScientificFunction('e')} className="calculator-button-function" />
          <CalculatorKey label="√" onClick={() => onScientificFunction('√')} className="calculator-button-function" />

          <CalculatorKey label="x²" onClick={() => onScientificFunction('x²')} className="calculator-button-function" />
          <CalculatorKey label="x³" onClick={() => onScientificFunction('x³')} className="calculator-button-function" />
          <CalculatorKey label="xʸ" onClick={() => onScientificFunction('xʸ')} className="calculator-button-function" />
          <CalculatorKey label="1/x" onClick={() => onScientificFunction('1/x')} className="calculator-button-function" />

          {/* Additional scientific functions */}
          <CalculatorKey label="%" onClick={() => onOperatorClick('%')} className="calculator-button-function" />
          <CalculatorKey label="mod" onClick={() => onOperatorClick('%')} className="calculator-button-function" />
          <CalculatorKey label="|x|" onClick={() => onScientificFunction('abs')} className="calculator-button-function" />
          <CalculatorKey label="rand" onClick={() => onScientificFunction('rand')} className="calculator-button-function" />
        </div>
      </motion.div>

      <div className="grid grid-cols-4 gap-2 flex-1 mt-auto">
        <CalculatorKey label="C" onClick={onClear} className="calculator-button-clear" />
        <CalculatorKey label="(" onClick={() => onOperatorClick('(')} className="calculator-button-operator" />
        <CalculatorKey label=")" onClick={() => onOperatorClick(')')} className="calculator-button-operator" />
        <CalculatorKey label="÷" onClick={() => onOperatorClick('/')} className="calculator-button-operator" />

        <CalculatorKey label="7" onClick={() => onNumberClick('7')} />
        <CalculatorKey label="8" onClick={() => onNumberClick('8')} />
        <CalculatorKey label="9" onClick={() => onNumberClick('9')} />
        <CalculatorKey label="×" onClick={() => onOperatorClick('*')} className="calculator-button-operator" />

        <CalculatorKey label="4" onClick={() => onNumberClick('4')} />
        <CalculatorKey label="5" onClick={() => onNumberClick('5')} />
        <CalculatorKey label="6" onClick={() => onNumberClick('6')} />
        <CalculatorKey label="−" onClick={() => onOperatorClick('-')} className="calculator-button-operator" />

        <CalculatorKey label="1" onClick={() => onNumberClick('1')} />
        <CalculatorKey label="2" onClick={() => onNumberClick('2')} />
        <CalculatorKey label="3" onClick={() => onNumberClick('3')} />
        <CalculatorKey label="+" onClick={() => onOperatorClick('+')} className="calculator-button-operator" />

        <CalculatorKey label="0" onClick={() => onNumberClick('0')} isExpanded={true} />
        <CalculatorKey label="." onClick={onDecimal} />
        <CalculatorKey label="=" onClick={onCalculate} className="calculator-button-equal" />
      </div>
    </div>
  );
};

export default CalculatorKeypad;
