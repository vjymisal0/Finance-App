import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, LogIn, Zap } from 'lucide-react';
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
        <p className="text-gray-400">Sign in to your financial dashboard</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
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
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
              className="w-full bg-gray-800 text-white pl-12 pr-12 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
              className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
            />
            <span className="ml-2 text-sm text-gray-300">Remember me</span>
          </label>
          <button
            type="button"
            className="text-sm text-green-500 hover:text-green-400 transition-colors"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            className="text-green-500 hover:text-green-400 transition-colors font-medium"
          >
            Sign up
          </button>
        </p>
      </div>

      <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <p className="text-gray-400 text-sm font-medium">Demo Credentials</p>
          <button
            type="button"
            onClick={fillDemoCredentials}
            className="text-xs text-green-500 hover:text-green-400 transition-colors px-3 py-1 bg-green-500/10 rounded-full flex items-center"
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
          Or create a new account using the registration form above
        </p>
      </div>
    </div>
  );
};

export default LoginForm;