import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import LoginForm from '@/components/auth/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/layout/NavigationBar';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  const handleLoginSuccess = () => {
    navigate('/profile');
  };

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-calculator-text mb-6">Sign In</h1>
          
          <div className="glass-morphism rounded-2xl p-6 mb-4">
            <LoginForm onSuccess={handleLoginSuccess} />
          </div>
        </motion.div>
      </div>
      <NavigationBar activeTab="profile" />
    </div>
  );
};

export default LoginPage;
