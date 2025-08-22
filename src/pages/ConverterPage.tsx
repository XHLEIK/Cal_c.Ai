
import UnitConverter from "@/components/converter/UnitConverter";
import NavigationBar from "@/components/layout/NavigationBar";

const ConverterPage = () => {
  return (
    <div className="min-h-screen pt-4 pb-20">
      <div className="container px-4">
        <h1 className="text-xl sm:text-2xl font-bold text-calculator-text mb-4">
          Unit Converter
        </h1>
        <UnitConverter />
      </div>
      <NavigationBar activeTab="converter" />
    </div>
  );
};

export default ConverterPage;
