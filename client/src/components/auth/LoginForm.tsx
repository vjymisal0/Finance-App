import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, LogIn, Zap, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types';

interface LoginFormProps {
  onToggleMode: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onToggleMode }) => {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(credentials);
    } catch (error) {
      // Error is handled by the context
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const fillDemoCredentials = () => {
    setCredentials({
      email: 'admin@example.com',
      password: 'password'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
        {/* Financial Icons Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 animate-pulse">
            <TrendingUp className="w-16 h-16 text-green-400" />
          </div>
          <div className="absolute top-40 right-32 animate-pulse delay-1000">
            <DollarSign className="w-20 h-20 text-green-400" />
          </div>
          <div className="absolute bottom-32 left-32 animate-pulse delay-2000">
            <BarChart3 className="w-18 h-18 text-green-400" />
          </div>
          <div className="absolute top-60 left-1/2 animate-pulse delay-3000">
            <TrendingUp className="w-14 h-14 text-green-400" />
          </div>
          <div className="absolute bottom-20 right-20 animate-pulse delay-4000">
            <DollarSign className="w-16 h-16 text-green-400" />
          </div>
        </div>

        {/* Geometric Shapes */}
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-green-500/10 to-blue-500/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-2xl"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-12 gap-4 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-green-500/20"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8 p-1">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center mb-8">
                <div className="w-20 h-20  flex-shrink-0 mr-3">
                  <img
                    src="/salary.png"
                    alt="FinStack Logo"
                    className="w-full h-full object-contain"
                  />
              </div>
                </div>
            </div>

            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Sign in to your financial dashboard</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={credentials.email}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/80 text-white pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/80 text-white pl-12 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-green-500 bg-gray-800 rounded focus:ring-green-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-300">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-green-400 hover:text-green-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-glow transform hover:scale-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-5 h-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-green-400 hover:text-green-300 transition-colors font-medium"
              >
                Sign up
              </button>
            </p>
          </div>

          {/* Demo Credentials Card */}
          <div className="mt-6 p-4 bg-gray-800/60 rounded-xl border border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <p className="text-gray-400 text-sm font-medium">Demo Credentials</p>
              <button
                type="button"
                onClick={fillDemoCredentials}
                className="text-xs text-green-400 hover:text-green-300 transition-colors px-3 py-1 bg-green-500/10 rounded-full flex items-center border border-green-500/20"
              >
                <Zap className="w-3 h-3 mr-1" />
                Quick Fill
              </button>
            </div>
            <div className="space-y-1">
              <p className="text-gray-300 text-sm">📧 Email: admin@example.com</p>
              <p className="text-gray-300 text-sm">🔑 Password: password</p>
            </div>
            <p className="text-gray-500 text-xs mt-2">
              Or create a new account using the registration form
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            Secure • Reliable • Modern Financial Management
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;