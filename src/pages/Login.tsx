import { useState } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AUTH_API_URL, AUTH_CONFIG, EXTERNAL_URLS } from '../constants';
import { Rocket, AlertCircle } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          realmId: AUTH_CONFIG.REALM_ID,
          clientId: AUTH_CONFIG.CLIENT_ID,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.message || 'Login failed');
        return;
      }

      if (data.data?.accessToken && data.data?.refreshToken && data.data?.user) {
        login(
          data.data.accessToken,
          data.data.refreshToken,
          {
            userId: data.data.user.userId,
            email: data.data.user.email,
            name: data.data.user.name,
            isEmailVerified: data.data.user.isEmailVerified,
            isMasterRealmUser: data.data.user.isMasterRealmUser,
            realmId: AUTH_CONFIG.REALM_ID,
            sessionId: '',
          }
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
            Collaborative Data Labeling Platform
          </p>
        </div>

        <Card title="Login to Your Account" className="shadow-2xl">
          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
              placeholder="Enter your password"
              required
              disabled={loading}
            />

            <Button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 space-y-3 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={() => window.open(EXTERNAL_URLS.FORGOT_PASSWORD, '_blank')}
              className="w-full px-4 py-2 text-sm font-medium text-space-blue hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            >
              Forgot Password?
            </button>

            <button
              onClick={() => window.open(EXTERNAL_URLS.CHANGE_PASSWORD, '_blank')}
              className="w-full px-4 py-2 text-sm font-medium text-space-gold hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
            >
              Change Password
            </button>

            <button
              onClick={() => window.open(EXTERNAL_URLS.SIGNUP, '_blank')}
              className="w-full px-4 py-2 text-sm font-medium text-space-green hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            >
              Create New Account
            </button>
          </div>

          <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
            Protected by enterprise-grade authentication
          </p>
        </Card>
      </div>
    </div>
  );
}
