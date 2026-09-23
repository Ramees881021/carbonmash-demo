import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { toast } from 'sonner';

interface LoginFormProps {
  onSwitchToSignup?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm = ({ onSwitchToSignup, onForgotPassword }: LoginFormProps) => {
  const [searchParams] = useSearchParams();
  const paramEmail = searchParams.get('email') || searchParams.get('locked_email') || '';
  const paramLocked = searchParams.get('lock_email') === 'true' || !!paramEmail;

  const [email, setEmail] = useState(paramEmail);
  const [isEmailLocked, setIsEmailLocked] = useState(paramLocked);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (paramEmail) {
      setEmail(paramEmail);
      setIsEmailLocked(true);
    }

    const handleMessage = (event: MessageEvent) => {
      const data = event.data;
      if (data && typeof data === 'object') {
        if (data.type === 'CARBONMASH_SSO_PAYLOAD' && data.email) {
          setEmail(data.email);
          setIsEmailLocked(true);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [paramEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = (isEmailLocked && (paramEmail || email) ? (paramEmail || email) : email).trim();
    const { error } = await signIn(cleanEmail, password);

    if (error) {
      toast.error(error.message);
      setLoading(false);
    } else {
      toast.success('Welcome back!');
      if (window.location.pathname.includes('dashboard')) {
        navigate('/dashboard');
      } else {
        window.location.href = '/dashboard';
      }
    }
  };

  return (
    <Card className="w-full border-0 shadow-none">
      <CardHeader className="text-center space-y-2 px-0">
        <CardTitle className="text-2xl font-bold">
          Welcome to <span className="text-foreground">Net-Z</span> <span style={{ color: '#00d084' }}>Platform</span>
        </CardTitle>
        <CardDescription>Sign in to your sustainability dashboard</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4 px-0">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="email">Work Email</Label>
              {isEmailLocked && (
                <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Lock className="h-3 w-3" />
                  Locked to Carbonmash
                </span>
              )}
            </div>
            <Input
              id="email"
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                if (!isEmailLocked) {
                  setEmail(e.target.value);
                }
              }}
              readOnly={isEmailLocked}
              className={isEmailLocked ? "bg-muted/50 cursor-not-allowed font-medium text-foreground select-none" : ""}
              required
            />
            {isEmailLocked && (
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <span>Email address is bound to your active Carbonmash session.</span>
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {onForgotPassword && (
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </button>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-4 px-0">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
