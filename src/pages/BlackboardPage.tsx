
import Blackboard from "@/components/blackboard/Blackboard";
import NavigationBar from "@/components/layout/NavigationBar";
import { motion } from "framer-motion";
import "@/styles/blackboard.css";

const BlackboardPage = () => {
  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="container px-4">
        <motion.h1
          className="text-2xl font-bold text-calculator-text mb-6 blackboard-title inline-block"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Interactive Blackboard
        </motion.h1>
        <div className="h-[calc(100vh-140px)]">
          <Blackboard />
        </div>
      </div>
      <NavigationBar activeTab="board" />
    </div>
  );
};

export default BlackboardPage;
