import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await resetPassword(email);
      if (!error) {
        setIsSubmitted(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="w-full max-w-md text-center">
        <h2 className="text-xl font-medium text-white mb-4">Check Your Email</h2>
        <p className="text-calculator-muted mb-6">
          We've sent a password reset link to <span className="text-white">{email}</span>. Please check your inbox and follow the instructions.
        </p>
        <Link to="/login" className="text-calculator-primary hover:underline">
          Back to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-calculator-muted text-sm mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full bg-calculator-button text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-calculator-primary"
          />
        </div>

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading}
          className="w-full calculator-button-equal py-3 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Reset Password'
          )}
        </motion.button>

        <div className="text-center text-calculator-muted text-sm">
          Remember your password?{' '}
          <Link to="/login" className="text-calculator-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
