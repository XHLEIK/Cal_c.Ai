
import { User, LogOut, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NavigationBar from "@/components/layout/NavigationBar";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const ProfilePage = () => {
  const { user, signOut, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    await signOut();
    setIsLoggingOut(false);
  };

  const handleSignIn = () => {
    navigate('/login');
  };

  const handleCreateAccount = () => {
    navigate('/signup');
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-6 pb-20 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-calculator-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="container px-4">
        <h1 className="text-2xl font-bold text-calculator-text mb-6">
          Profile
        </h1>

        <div className="glass-morphism rounded-2xl p-8 flex flex-col items-center justify-center">
          {user ? (
            // Logged in state
            <>
              <div className="w-24 h-24 bg-calculator-primary/20 rounded-full flex items-center justify-center mb-4">
                <User size={40} className="text-calculator-primary" />
              </div>
              <h2 className="text-xl font-medium text-white mb-1">
                {user.email}
              </h2>
              <p className="text-calculator-muted mb-6">
                Account ID: {user.id.substring(0, 8)}...
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSignOut}
                disabled={isLoggingOut}
                className="calculator-button px-8 py-3 w-full max-w-xs flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <LogOut size={18} />
                    Sign Out
                  </>
                )}
              </motion.button>

              <div className="mt-8 w-full max-w-xs">
                <h3 className="text-lg font-medium text-white mb-4">Premium Features (Unlocked):</h3>
                <ul className="text-calculator-muted space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    AI Math Assistant Chat
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    Save Blackboard Work
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    Bookmark Calculations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    Cloud Sync Across Devices
                  </li>
                </ul>
              </div>
            </>
          ) : (
            // Logged out state
            <>
              <div className="w-24 h-24 bg-calculator-button rounded-full flex items-center justify-center mb-4">
                <User size={40} className="text-calculator-muted" />
              </div>
              <h2 className="text-xl font-medium text-white mb-1">Guest User</h2>
              <p className="text-calculator-muted mb-6">Sign in to access AI features</p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSignIn}
                className="calculator-button-equal px-8 py-3 mb-4 w-full max-w-xs"
              >
                Sign In
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleCreateAccount}
                className="calculator-button px-8 py-3 w-full max-w-xs"
              >
                Create Account
              </motion.button>

              <div className="mt-8 w-full max-w-xs">
                <h3 className="text-lg font-medium text-white mb-4">Features requiring account:</h3>
                <ul className="text-calculator-muted space-y-2">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    AI Math Assistant Chat
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    Save Blackboard Work
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    Bookmark Calculations
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-calculator-primary rounded-full mr-2"></span>
                    Cloud Sync Across Devices
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      <NavigationBar activeTab="profile" />
    </div>
  );
};

export default ProfilePage;
