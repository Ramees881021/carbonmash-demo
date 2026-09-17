import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [view, setView] = useState<AuthView>(tabParam === 'signup' ? 'signup' : 'login');

  useEffect(() => {
    if (tabParam === 'signup') {
      setView('signup');
    } else if (tabParam === 'login') {
      setView('login');
    }
  }, [tabParam]);

  if (view === 'forgot-password') {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <header className="w-full px-6 py-4 flex items-center justify-end">
          <button
            onClick={() => setView('login')}
            className="text-sm text-primary hover:underline"
          >
            Back to Sign In
          </button>
        </header>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <ForgotPasswordForm onBack={() => setView('login')} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {view === 'login' ? (
            <LoginForm 
              onSwitchToSignup={() => setView('signup')} 
              onForgotPassword={() => setView('forgot-password')} 
            />
          ) : (
            <SignupForm onSwitchToLogin={() => setView('login')} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
