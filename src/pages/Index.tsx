
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "lucide-react";
import { Link } from "react-router-dom";
import NavigationBar from "@/components/layout/NavigationBar";
import Calculator from "@/components/calculator/Calculator";
import UnitConverter from "@/components/converter/UnitConverter";
import AIChat from "@/components/chat/AIChat";
import Blackboard from "@/components/blackboard/Blackboard";
import SplashScreen from "@/components/SplashScreen";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const [showSplash, setShowSplash] = useState(() => {
    // Check if splash has been shown before
    const hasShownSplash = localStorage.getItem('hasShownSplash');
    return !hasShownSplash;
  });
  // Active section is now controlled only by the bottom navigation bar
  const [activeSection, setActiveSection] = useState<"home" | "converter" | "chat" | "board" | "profile">("home");
  const { user } = useAuth();

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Set flag in localStorage to indicate splash has been shown
        localStorage.setItem('hasShownSplash', 'true');
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <div className="min-h-screen pb-20 flex flex-col">
        <div className="container px-4 pt-4 flex-1 flex flex-col">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: showSplash ? 2.5 : 0, duration: 0.5 }}
            className="flex-1 flex flex-col h-full"
          >
            <div className="absolute top-4 left-4 z-20">
              <motion.h1
                className="text-2xl font-bold app-logo"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: showSplash ? 2.7 : 0.2, duration: 0.8 }}
              >
                Cal<span className="text-calculator-primary">_c.Ai</span>
              </motion.h1>
            </div>

            {/* Calculator Display Section - Fixed under app name */}
            {activeSection === "home" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: showSplash ? 2.9 : 0.4, duration: 0.5 }}
                className="mt-16 mb-2 w-full max-w-md mx-auto z-10"
              >
                <div className="calculator-display-container">
                  <div className="calculator-display glass-morphism rounded-xl p-4 overflow-hidden">
                    {/* Expression Section */}
                    <div className="calculator-expression-container mb-1">
                      <div className="text-calculator-muted text-right text-xl overflow-x-auto whitespace-nowrap scrollbar-none py-1" id="calculator-expression">
                        0
                      </div>
                    </div>

                    {/* Result Section */}
                    <div className="calculator-result-container">
                      <div className="text-calculator-text text-right text-4xl font-semibold overflow-x-auto whitespace-nowrap scrollbar-none py-1" id="calculator-result">
                        0
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeSection === "home" && (
                <motion.div
                  key="calculator"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="flex-1 flex flex-col justify-end"
                >
                  <Calculator />
                </motion.div>
              )}

              {activeSection === "converter" && (
                <motion.div
                  key="converter"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <UnitConverter />
                </motion.div>
              )}

              {activeSection === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-[calc(100vh-200px)]"
                >
                  <AIChat />
                </motion.div>
              )}

              {activeSection === "board" && (
                <motion.div
                  key="board"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="h-[calc(100vh-200px)]"
                >
                  <Blackboard />
                </motion.div>
              )}

              {activeSection === "profile" && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="glass-morphism rounded-2xl p-8 flex flex-col items-center justify-center">
                    {user ? (
                      <>
                        <div className="w-24 h-24 bg-calculator-primary/20 rounded-full flex items-center justify-center mb-4">
                          <User size={40} className="text-calculator-primary" />
                        </div>
                        <h2 className="text-xl font-medium text-white mb-1">
                          {user.email}
                        </h2>
                        <p className="text-calculator-muted mb-4">
                          View your full profile for more options
                        </p>
                        <Link to="/profile" className="calculator-button-equal px-8 py-3 block text-center">
                          Go to Profile
                        </Link>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-calculator-button rounded-full flex items-center justify-center mb-4">
                          <User size={40} className="text-calculator-muted" />
                        </div>
                        <h2 className="text-xl font-medium text-white mb-1">Guest User</h2>
                        <p className="text-calculator-muted mb-4">Sign in to access AI features</p>
                        <div className="flex flex-col w-full max-w-xs gap-3">
                          <Link to="/login" className="calculator-button-equal px-8 py-3 block text-center">
                            Sign In
                          </Link>
                          <Link to="/signup" className="calculator-button px-8 py-3 block text-center">
                            Create Account
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <NavigationBar
        activeTab={activeSection}
        onTabChange={(tab) => setActiveSection(tab as "home" | "converter" | "chat" | "board" | "profile")}
      />
    </>
  );
};

export default Index;
