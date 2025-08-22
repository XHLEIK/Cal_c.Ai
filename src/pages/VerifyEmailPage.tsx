import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import NavigationBar from '@/components/layout/NavigationBar';
import { toast } from '@/components/ui/sonner';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  // Get email from location state or use user email
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    } else if (user?.email) {
      setEmail(user.email);
    } else {
      // If no email is found, redirect to signup
      navigate('/signup');
    }
  }, [location.state, user, navigate]);

  // If user is already confirmed, redirect to profile
  useEffect(() => {
    if (user?.email_confirmed_at) {
      setIsVerified(true);

      // Show success message
      toast.success('Email verified!', {
        description: 'Your email has been verified successfully.'
      });

      // Redirect to profile after a short delay
      const timer = setTimeout(() => {
        navigate('/profile');
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [user, navigate]);

  const handleResendEmail = async () => {
    if (!email) return;

    setIsVerifying(true);

    try {
      const { error } = await useAuth().resendVerificationEmail(email);

      if (!error) {
        toast.success('Verification email sent', {
          description: 'Please check your inbox for the verification link.'
        });
      }
    } catch (error) {
      toast.error('Error', {
        description: 'Failed to resend verification email. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen pt-6 pb-20">
      <div className="container px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-calculator-text mb-6">
            Verify Your Email
          </h1>

          <div className="glass-morphism rounded-2xl p-6 mb-4">
            {isVerified ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2">Email Verified!</h2>
                <p className="text-calculator-muted text-center mb-6">
                  Your email has been verified successfully. Redirecting to your profile...
                </p>
                <div className="animate-spin">
                  <Loader2 size={24} className="text-calculator-primary" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="w-16 h-16 bg-calculator-primary/20 rounded-full flex items-center justify-center mb-4">
                  <Mail size={32} className="text-calculator-primary" />
                </div>
                <h2 className="text-xl font-medium text-white mb-2">Check Your Email</h2>
                <p className="text-calculator-muted text-center mb-2">
                  We've sent a verification link to:
                </p>
                <p className="text-white font-medium mb-6">{email}</p>
                <p className="text-calculator-muted text-center mb-6">
                  Please click the link in the email to verify your account.
                </p>

                <button
                  onClick={handleResendEmail}
                  disabled={isVerifying}
                  className="calculator-button px-8 py-3 flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Resend Verification Email'
                  )}
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <NavigationBar activeTab="profile" />
    </div>
  );
};

export default VerifyEmailPage;
