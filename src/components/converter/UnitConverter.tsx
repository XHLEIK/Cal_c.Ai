
import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DollarSign, RefreshCw, Search } from "lucide-react";
import {
  currencies,
  fetchExchangeRates,
  convertCurrency,
  formatCurrency,
  ExchangeRates
} from "@/services/currencyService";

type UnitCategory =
  | "length"
  | "area"
  | "volume"
  | "weight"
  | "temperature"
  | "numbers"
  | "currency";

interface UnitOption {
  label: string;
  value: string;
  conversionFactor: number;
  symbol?: string; // Optional currency symbol
}

const UNIT_CATEGORIES: Record<UnitCategory, UnitOption[]> = {
  length: [
    { label: "Millimeters (mm)", value: "mm", conversionFactor: 1 },
    { label: "Centimeters (cm)", value: "cm", conversionFactor: 10 },
    { label: "Meters (m)", value: "m", conversionFactor: 1000 },
    { label: "Kilometers (km)", value: "km", conversionFactor: 1000000 },
    { label: "Inches (in)", value: "in", conversionFactor: 25.4 },
    { label: "Feet (ft)", value: "ft", conversionFactor: 304.8 },
    { label: "Yards (yd)", value: "yd", conversionFactor: 914.4 },
    { label: "Miles (mi)", value: "mi", conversionFactor: 1609344 },
  ],
  area: [
    { label: "Square Millimeters (mm²)", value: "mm2", conversionFactor: 1 },
    { label: "Square Centimeters (cm²)", value: "cm2", conversionFactor: 100 },
    { label: "Square Meters (m²)", value: "m2", conversionFactor: 1000000 },
    { label: "Hectares (ha)", value: "ha", conversionFactor: 10000000000 },
    { label: "Square Kilometers (km²)", value: "km2", conversionFactor: 1000000000000 },
    { label: "Square Inches (in²)", value: "in2", conversionFactor: 645.16 },
    { label: "Square Feet (ft²)", value: "ft2", conversionFactor: 92903.04 },
    { label: "Square Yards (yd²)", value: "yd2", conversionFactor: 836127.36 },
    { label: "Acres", value: "acre", conversionFactor: 4046856422.4 },
  ],
  volume: [
    { label: "Milliliters (ml)", value: "ml", conversionFactor: 1 },
    { label: "Liters (L)", value: "l", conversionFactor: 1000 },
    { label: "Cubic Meters (m³)", value: "m3", conversionFactor: 1000000 },
    { label: "Gallons (US)", value: "gal", conversionFactor: 3785.41 },
    { label: "Quarts (US)", value: "qt", conversionFactor: 946.35 },
    { label: "Pints (US)", value: "pt", conversionFactor: 473.18 },
    { label: "Cups", value: "cup", conversionFactor: 236.59 },
    { label: "Fluid Ounces (US)", value: "floz", conversionFactor: 29.57 },
    { label: "Tablespoons", value: "tbsp", conversionFactor: 14.79 },
    { label: "Teaspoons", value: "tsp", conversionFactor: 4.93 },
  ],
  weight: [
    { label: "Milligrams (mg)", value: "mg", conversionFactor: 0.001 },
    { label: "Grams (g)", value: "g", conversionFactor: 1 },
    { label: "Kilograms (kg)", value: "kg", conversionFactor: 1000 },
    { label: "Metric Tons (t)", value: "t", conversionFactor: 1000000 },
    { label: "Ounces (oz)", value: "oz", conversionFactor: 28.35 },
    { label: "Pounds (lb)", value: "lb", conversionFactor: 453.59 },
    { label: "Stone", value: "st", conversionFactor: 6350.29 },
    { label: "Short Tons (US)", value: "ton", conversionFactor: 907184.74 },
  ],
  temperature: [
    { label: "Celsius (°C)", value: "c", conversionFactor: 0 }, // Special case
    { label: "Fahrenheit (°F)", value: "f", conversionFactor: 0 }, // Special case
    { label: "Kelvin (K)", value: "k", conversionFactor: 0 }, // Special case
  ],
  numbers: [
    { label: "Decimal", value: "decimal", conversionFactor: 0 }, // Special case
    { label: "Binary", value: "binary", conversionFactor: 0 }, // Special case
    { label: "Octal", value: "octal", conversionFactor: 0 }, // Special case
    { label: "Hexadecimal", value: "hex", conversionFactor: 0 }, // Special case
  ],
  currency: currencies.map(currency => ({
    label: `${currency.name} (${currency.code})`,
    value: currency.code.toLowerCase(),
    conversionFactor: 1, // Will be updated with real-time rates
    symbol: currency.symbol
  })),
};

const UnitConverter: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<UnitCategory>("currency");
  const [fromValue, setFromValue] = useState<string>("");
  const [fromUnit, setFromUnit] = useState<string>(UNIT_CATEGORIES[activeCategory][0].value);
  const [toUnit, setToUnit] = useState<string>(UNIT_CATEGORIES[activeCategory][1].value);
  const [result, setResult] = useState<string>("");
  const [exchangeRates, setExchangeRates] = useState<ExchangeRates | null>(null);
  const [isLoadingRates, setIsLoadingRates] = useState<boolean>(false);
  const [selectedConverter, setSelectedConverter] = useState<UnitCategory>("currency");

  // Fetch exchange rates when the component mounts or when the currency category is selected
  useEffect(() => {
    if (activeCategory === "currency") {
      const loadExchangeRates = async () => {
        setIsLoadingRates(true);
        try {
          const rates = await fetchExchangeRates();
          setExchangeRates(rates);
        } catch (error) {
          console.error("Failed to fetch exchange rates:", error);
        } finally {
          setIsLoadingRates(false);
        }
      };

      loadExchangeRates();
    }
  }, [activeCategory]);

  const handleCategoryChange = (category: UnitCategory) => {
    setActiveCategory(category);
    setFromUnit(UNIT_CATEGORIES[category][0].value);
    setToUnit(UNIT_CATEGORIES[category][1].value);
    setFromValue("");
    setResult("");
  };

  const handleConverterSelect = (category: UnitCategory) => {
    setSelectedConverter(category);
    handleCategoryChange(category);
  };



  const handleConvert = () => {
    if (!fromValue) {
      setResult("");
      return;
    }

    const value = parseFloat(fromValue);

    if (isNaN(value)) {
      setResult("Invalid input");
      return;
    }

    if (activeCategory === "temperature") {
      // Temperature conversions
      let resultValue = 0;

      if (fromUnit === "c" && toUnit === "f") {
        resultValue = (value * 9/5) + 32;
      } else if (fromUnit === "c" && toUnit === "k") {
        resultValue = value + 273.15;
      } else if (fromUnit === "f" && toUnit === "c") {
        resultValue = (value - 32) * 5/9;
      } else if (fromUnit === "f" && toUnit === "k") {
        resultValue = (value - 32) * 5/9 + 273.15;
      } else if (fromUnit === "k" && toUnit === "c") {
        resultValue = value - 273.15;
      } else if (fromUnit === "k" && toUnit === "f") {
        resultValue = (value - 273.15) * 9/5 + 32;
      } else {
        resultValue = value; // Same unit
      }

      setResult(resultValue.toFixed(2));
      return;
    }

    if (activeCategory === "numbers") {
      // Number system conversions
      let resultValue = "";

      try {
        if (fromUnit === "decimal") {
          const decimal = parseInt(fromValue, 10);
          if (toUnit === "binary") resultValue = decimal.toString(2);
          else if (toUnit === "octal") resultValue = decimal.toString(8);
          else if (toUnit === "hex") resultValue = decimal.toString(16).toUpperCase();
          else resultValue = decimal.toString();
        } else if (fromUnit === "binary") {
          const decimal = parseInt(fromValue, 2);
          if (toUnit === "decimal") resultValue = decimal.toString();
          else if (toUnit === "octal") resultValue = decimal.toString(8);
          else if (toUnit === "hex") resultValue = decimal.toString(16).toUpperCase();
          else resultValue = decimal.toString(2);
        } else if (fromUnit === "octal") {
          const decimal = parseInt(fromValue, 8);
          if (toUnit === "decimal") resultValue = decimal.toString();
          else if (toUnit === "binary") resultValue = decimal.toString(2);
          else if (toUnit === "hex") resultValue = decimal.toString(16).toUpperCase();
          else resultValue = decimal.toString(8);
        } else if (fromUnit === "hex") {
          const decimal = parseInt(fromValue, 16);
          if (toUnit === "decimal") resultValue = decimal.toString();
          else if (toUnit === "binary") resultValue = decimal.toString(2);
          else if (toUnit === "octal") resultValue = decimal.toString(8);
          else resultValue = decimal.toString(16).toUpperCase();
        }
      } catch (error) {
        resultValue = "Invalid input";
      }

      setResult(resultValue);
      return;
    }

    if (activeCategory === "currency") {
      // Currency conversions
      if (!exchangeRates) {
        setResult("Loading exchange rates...");
        return;
      }

      try {
        // Get currency codes (convert to uppercase for the API)
        const fromCurrencyCode = fromUnit.toUpperCase();
        const toCurrencyCode = toUnit.toUpperCase();

        // Find the currency options for display purposes
        const fromOption = UNIT_CATEGORIES.currency.find(u => u.value === fromUnit);
        const toOption = UNIT_CATEGORIES.currency.find(u => u.value === toUnit);

        if (!fromOption || !toOption) {
          setResult("Invalid currency selection");
          return;
        }

        // Convert the currency using real-time rates
        const convertedAmount = convertCurrency(
          parseFloat(fromValue),
          fromCurrencyCode,
          toCurrencyCode,
          exchangeRates.rates
        );

        // Format the result with the appropriate currency symbol
        const formattedResult = formatCurrency(convertedAmount, toCurrencyCode, currencies);

        setResult(formattedResult);
      } catch (error) {
        console.error("Currency conversion error:", error);
        setResult("Conversion error");
      }
      return;
    }

    // For other categories, use conversion factors
    const fromOption = UNIT_CATEGORIES[activeCategory].find(u => u.value === fromUnit);
    const toOption = UNIT_CATEGORIES[activeCategory].find(u => u.value === toUnit);

    if (fromOption && toOption) {
      const baseValue = value * fromOption.conversionFactor;
      const resultValue = baseValue / toOption.conversionFactor;
      setResult(resultValue.toFixed(6).replace(/\.?0+$/, ""));
    }
  };

  const categories: { label: string; value: UnitCategory }[] = [
    { label: "Currency", value: "currency" },
    { label: "Length", value: "length" },
    { label: "Area", value: "area" },
    { label: "Volume", value: "volume" },
    { label: "Weight", value: "weight" },
    { label: "Temperature", value: "temperature" },
    { label: "Numbers", value: "numbers" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-lg font-medium mb-4 text-center">Unit Converter</h2>

      {/* Active Converter */}
      <div className="glass-morphism rounded-2xl p-4 sm:p-5 mb-5">
        <h3 className="text-lg font-medium mb-3 text-center">
          {categories.find(c => c.value === activeCategory)?.label || "Converter"}
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-calculator-muted text-sm mb-2">From</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={fromValue}
                onChange={(e) => {
                  setFromValue(e.target.value);
                  if (e.target.value) handleConvert();
                }}
                placeholder="Enter value"
                className="flex-1 bg-calculator-button text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-calculator-primary"
              />
              <div className="relative w-full sm:w-auto">
                <div className="relative">
                  <select
                    value={fromUnit}
                    onChange={(e) => {
                      setFromUnit(e.target.value);
                      if (fromValue) handleConvert();
                    }}
                    className={`bg-calculator-button text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-calculator-primary w-full ${
                      activeCategory === "currency" && isLoadingRates ? "opacity-70" : ""
                    }`}
                    disabled={activeCategory === "currency" && isLoadingRates}
                  >
                    {UNIT_CATEGORIES[activeCategory].map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>

                  {activeCategory === "currency" && isLoadingRates && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-calculator-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-calculator-muted text-sm mb-2">To</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={result}
                readOnly
                placeholder="Result"
                className="flex-1 bg-calculator-button text-white p-3 rounded-lg focus:outline-none"
              />
              <div className="relative w-full sm:w-auto">
                <div className="relative">
                  <select
                    value={toUnit}
                    onChange={(e) => {
                      setToUnit(e.target.value);
                      if (fromValue) handleConvert();
                    }}
                    className={`bg-calculator-button text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-calculator-primary w-full ${
                      activeCategory === "currency" && isLoadingRates ? "opacity-70" : ""
                    }`}
                    disabled={activeCategory === "currency" && isLoadingRates}
                  >
                    {UNIT_CATEGORIES[activeCategory].map((unit) => (
                      <option key={unit.value} value={unit.value}>
                        {unit.label}
                      </option>
                    ))}
                  </select>

                  {activeCategory === "currency" && isLoadingRates && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-calculator-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleConvert}
            className="w-full calculator-button-equal py-3 mt-2"
          >
            Convert
          </motion.button>

          {/* Currency rates note and refresh button */}
          {activeCategory === "currency" && (
            <div className="mt-3">
              <div className="flex items-center justify-center gap-2">
                <p className="text-calculator-muted text-xs">
                  {isLoadingRates
                    ? "Loading exchange rates..."
                    : exchangeRates
                      ? `Rates last updated: ${exchangeRates.lastUpdated.toLocaleString()}`
                      : "Exchange rates not available"
                  }
                </p>
                <button
                  onClick={async (e) => {
                    e.preventDefault();
                    setIsLoadingRates(true);
                    try {
                      const rates = await fetchExchangeRates();
                      setExchangeRates(rates);
                      if (fromValue) handleConvert();
                    } catch (error) {
                      console.error("Failed to refresh exchange rates:", error);
                    } finally {
                      setIsLoadingRates(false);
                    }
                  }}
                  disabled={isLoadingRates}
                  className="text-calculator-primary hover:text-calculator-primary/80 transition-colors"
                  title="Refresh exchange rates"
                >
                  <RefreshCw size={14} className={isLoadingRates ? "animate-spin" : ""} />
                </button>
              </div>
              <p className="text-calculator-muted text-xs text-center mt-1">
                Real-time rates from Open Exchange Rates API
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Converter Type Grid */}
      <div className="glass-morphism rounded-2xl p-4">
        <h3 className="text-sm font-medium mb-3 text-center text-calculator-muted">Select Converter Type</h3>
        <div className="converter-grid">
          {categories.map((category) => (
            <motion.button
              key={category.value}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleConverterSelect(category.value)}
              className={cn(
                "converter-card p-3 flex flex-col items-center justify-center gap-2 h-20",
                selectedConverter === category.value
                  ? "converter-card-active"
                  : "bg-calculator-button/60 text-calculator-muted hover:text-white hover:bg-calculator-button"
              )}
              data-category={category.value}
            >
              <div className="converter-card-icon">
                {category.value === "currency" ? (
                  <DollarSign size={28} className={`${selectedConverter === category.value ? "text-white" : "text-calculator-primary"} currency-icon`} />
                ) : category.value === "length" ? (
                  <span>📏</span>
                ) : category.value === "area" ? (
                  <span>📐</span>
                ) : category.value === "volume" ? (
                  <span>🧊</span>
                ) : category.value === "weight" ? (
                  <span>⚖️</span>
                ) : category.value === "temperature" ? (
                  <span>🌡️</span>
                ) : (
                  <span>🔢</span>
                )}
              </div>
              <span className="text-xs font-medium">{category.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;
