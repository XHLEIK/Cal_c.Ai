import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const EmailVerificationHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        // Get the token and email from the URL
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        
        if (!token || !email) {
          toast.error('Invalid verification link', {
            description: 'The verification link is invalid or has expired.'
          });
          navigate('/login');
          return;
        }
        
        // Verify the token
        const { error } = await verifyOtp(email, token);
        
        if (error) {
          toast.error('Verification failed', {
            description: 'The verification link is invalid or has expired.'
          });
          navigate('/login');
          return;
        }
        
        // If successful, show success message and redirect to profile
        toast.success('Email verified!', {
          description: 'Your email has been verified successfully.'
        });
        
        // Redirect to profile page
        navigate('/profile');
      } catch (error) {
        console.error('Error verifying email:', error);
        toast.error('Verification failed', {
          description: 'An unexpected error occurred. Please try again.'
        });
        navigate('/login');
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams, verifyOtp, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {isVerifying && (
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-calculator-primary mb-4" />
          <p className="text-calculator-text text-lg">Verifying your email...</p>
        </div>
      )}
    </div>
  );
};

export default EmailVerificationHandler;
