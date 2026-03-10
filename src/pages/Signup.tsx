import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AUTH_API_URL, AUTH_CONFIG } from '../constants';
import { Rocket, AlertCircle, CheckCircle } from 'lucide-react';

interface SignupProps {
  onSwitchToLogin: () => void;
}

export function Signup({ onSwitchToLogin }: SignupProps) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateForm = () => {
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }

    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (!password) {
      setError('Password is required');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    // if (!/[A-Z]/.test(password)) {
    //   setError('Password must contain at least one uppercase letter');
    //   return false;
    // }

    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number');
      return false;
    }

    // if (!/[!@#$%^&*]/.test(password)) {
    //   setError('Password must contain at least one special character (!@#$%^&*)');
    //   return false;
    // }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.toLowerCase().trim(),
          password,
          realmId: AUTH_CONFIG.REALM_ID,
          clientId: AUTH_CONFIG.CLIENT_ID,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Signup failed');
        return;
      }

      if (data.data?.id && data.data?.email && data.data?.name) {
        setSuccess(true);
        onSwitchToLogin()
        // setTimeout(() => {
        //   login(
        //     data.data.accessToken,
        //     data.data.refreshToken,
        //     {
        //       userId: data.data.user.userId,
        //       email: data.data.user.email,
        //       name: data.data.user.name,
        //       isEmailVerified: data.data.user.isEmailVerified,
        //       isMasterRealmUser: data.data.user.isMasterRealmUser,
        //       realmId: AUTH_CONFIG.REALM_ID,
        //       sessionId: '',
        //     }
        //   );
        // }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center p-4 ${
          theme === 'dark'
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
        }`}
      >
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Account Created!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Welcome to DataHub, {name}!
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Redirecting to your dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-4 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
          : 'bg-gradient-to-br from-blue-50 via-white to-blue-50'
      }`}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Rocket className="w-16 h-16 text-space-blue animate-bounce" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-space-blue to-space-purple bg-clip-text text-transparent">
            DataHub
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create Your Account
          </p>
        </div>

        <Card title="Sign Up" className="shadow-2xl">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              disabled={loading}
            />

            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              disabled={loading}
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min 8 chars, 1 uppercase, 1 number, 1 special"
              required
              disabled={loading}
            />

            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !name || !email || !password || !confirmPassword}
              className="w-full"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
            <p className="text-center text-gray-600 dark:text-gray-400 text-sm mb-4">
              Already have an account?
            </p>
            <button
              onClick={onSwitchToLogin}
              className="w-full px-4 py-2 text-sm font-medium text-space-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Sign In Instead
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            By creating an account, you agree to our Terms of Service
          </p>
        </Card>
      </div>
    </div>
  );
}
