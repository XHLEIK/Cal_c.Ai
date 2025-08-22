import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface SignupFormProps {
  onSuccess?: () => void;
}

const SignupForm = ({ onSuccess }: SignupFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const { signUp } = useAuth();

  const validatePassword = () => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePassword()) {
      return;
    }

    setIsLoading(true);

    try {
      const { error, data } = await signUp(email, password);

      if (!error) {
        // If onSuccess callback is provided, call it
        if (onSuccess) {
          onSuccess();
        } else {
          // Otherwise, navigate to the verification page
          navigate('/verify-email', { state: { email } });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

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

        <div>
          <label htmlFor="password" className="block text-calculator-muted text-sm mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="w-full bg-calculator-button text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-calculator-primary"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-calculator-muted hover:text-white"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-calculator-muted text-sm mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            className="w-full bg-calculator-button text-white p-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-calculator-primary"
          />
        </div>

        {passwordError && (
          <div className="text-red-500 text-sm">{passwordError}</div>
        )}

        <motion.button
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading}
          className="w-full calculator-button-equal py-3 flex items-center justify-center"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Create Account'
          )}
        </motion.button>

        <div className="text-center text-calculator-muted text-sm">
          Already have an account?{' '}
          <Link to="/login" className="text-calculator-primary hover:underline">
            Sign in
          </Link>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
