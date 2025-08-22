
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import CalculatorKeypad from "./CalculatorKeypad";

const Calculator = () => {
  const [expression, setExpression] = useState("");
  const [result, setResult] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [scientificMode, setScientificMode] = useState(false);
  const { toast } = useToast();

  const handleNumberClick = (num: string) => {
    setExpression((prev) => prev + num);
  };

  const handleOperatorClick = (op: string) => {
    setExpression((prev) => prev + op);
  };

  const handleDecimal = () => {
    // Get last number in expression
    const parts = expression.split(/[-+*/]/);
    const lastPart = parts[parts.length - 1];

    // Only add decimal if last number doesn't already have one
    if (!lastPart.includes('.')) {
      setExpression((prev) => prev + '.');
    }
  };

  const handleDelete = () => {
    setExpression((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    setExpression("");
    setResult("");
  };

  const handleScientificFunction = (func: string) => {
    switch (func) {
      case 'sin':
        setExpression((prev) => prev + "sin(");
        break;
      case 'cos':
        setExpression((prev) => prev + "cos(");
        break;
      case 'tan':
        setExpression((prev) => prev + "tan(");
        break;
      case 'log':
        setExpression((prev) => prev + "log(");
        break;
      case 'ln':
        setExpression((prev) => prev + "ln(");
        break;
      case 'sqrt':
      case '√':
        setExpression((prev) => prev + "sqrt(");
        break;
      case 'x²':
        setExpression((prev) => prev + "^2");
        break;
      case 'x³':
        setExpression((prev) => prev + "^3");
        break;
      case 'xʸ':
        setExpression((prev) => prev + "^");
        break;
      case 'π':
        setExpression((prev) => prev + "π");
        break;
      case 'e':
        setExpression((prev) => prev + "e");
        break;
      case '1/x':
        setExpression((prev) => `1/(${prev})`);
        break;
      case 'abs':
        setExpression((prev) => `abs(${prev})`);
        break;
      case 'rand':
        // Generate random number between 0 and 1
        setExpression((prev) => prev + "rand()");
        break;
      default:
        break;
    }
  };

  const calculateResult = () => {
    if (!expression) return;

    try {
      // Replace scientific symbols with their JavaScript equivalents
      let processedExpression = expression
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E')
        .replace(/sin\(/g, 'Math.sin(')
        .replace(/cos\(/g, 'Math.cos(')
        .replace(/tan\(/g, 'Math.tan(')
        .replace(/log\(/g, 'Math.log10(')
        .replace(/ln\(/g, 'Math.log(')
        .replace(/sqrt\(/g, 'Math.sqrt(')
        .replace(/abs\(/g, 'Math.abs(')
        .replace(/rand\(\)/g, 'Math.random()')
        .replace(/%/g, '/100*')
        .replace(/\^/g, '**');

      // eslint-disable-next-line no-eval
      const calculatedResult = eval(processedExpression).toString();
      setResult(calculatedResult);

      setHistory((prev) => [
        ...prev,
        `${expression} = ${calculatedResult}`
      ].slice(-5)); // Keep only last 5 calculations
    } catch (error) {
      console.error("Calculation error:", error);
      toast({
        title: "Calculation Error",
        description: "Invalid expression",
        variant: "destructive",
      });
    }
  };

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  const toggleScientificMode = () => {
    setScientificMode(!scientificMode);
  };

  // Format the expression for display
  const formatExpression = (expr: string): string => {
    if (!expr) return "0";

    // Replace operators with more readable symbols
    return expr
      .replace(/\*/g, "×")
      .replace(/\//g, "÷")
      .replace(/\+/g, "+")
      .replace(/-/g, "−")
      .replace(/\^/g, "^");
  };

  // Format the result for display
  const formatResult = (res: string): string => {
    if (!res) return "0";

    // Check if it's a number that needs formatting
    const num = parseFloat(res);
    if (!isNaN(num)) {
      // Format large numbers with commas
      if (Math.abs(num) >= 1000) {
        return num.toLocaleString('en-US', {
          maximumFractionDigits: 10,
          minimumFractionDigits: 0
        });
      }

      // Format decimal numbers
      if (res.includes('.')) {
        return num.toLocaleString('en-US', {
          maximumFractionDigits: 10,
          minimumFractionDigits: 0
        });
      }
    }

    return res;
  };

  // Update the display elements directly
  useEffect(() => {
    const expressionElement = document.getElementById('calculator-expression');
    const resultElement = document.getElementById('calculator-result');

    if (expressionElement) {
      expressionElement.textContent = formatExpression(expression);
    }

    if (resultElement) {
      // Store previous result to check if it changed
      const prevResult = resultElement.textContent;
      const newResult = formatResult(result);

      // Update the result text
      resultElement.textContent = newResult;

      // Add animation class if result changed
      if (prevResult !== newResult && newResult !== "0") {
        resultElement.classList.add('changed');

        // Remove the class after animation completes
        setTimeout(() => {
          resultElement.classList.remove('changed');
        }, 500);
      }
    }
  }, [expression, result]);

  return (
    <div className="w-full max-w-md mx-auto flex-1 flex flex-col justify-end">
      <div className="calculator-container flex flex-col gap-0">
        <CalculatorKeypad
          onNumberClick={handleNumberClick}
          onOperatorClick={handleOperatorClick}
          onClear={handleClear}
          onCalculate={calculateResult}
          onDecimal={handleDecimal}
          onDelete={handleDelete}
          scientificMode={scientificMode}
          onScientificFunction={handleScientificFunction}
          onToggleScientificMode={toggleScientificMode}
        />
      </div>
    </div>
  );
};

export default Calculator;
