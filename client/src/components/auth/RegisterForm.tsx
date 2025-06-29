import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, UserPlus, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterCredentials } from '../../types';

interface RegisterFormProps {
  onToggleMode: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onToggleMode }) => {
  const { register, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [credentials, setCredentials] = useState<RegisterCredentials>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (credentials.password !== credentials.confirmPassword) {
      return;
    }

    try {
      await register(credentials);
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

  const passwordsMatch = credentials.password === credentials.confirmPassword;
  const isFormValid = credentials.name && credentials.email && credentials.password && passwordsMatch;

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

      {/* Register Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="glass rounded-3xl p-8 shadow-2xl border border-gray-700/50 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-3">
            <div className="flex items-center justify-center mb-6"> 
              <div className="flex items-center mb-8">
                <div className="w-20 h-20  mt-4 flex-shrink-0 mr-3 ">
                  <img
                    src="/salary.png"
                    alt="FinStack Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-400">Join us to manage your finances</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={credentials.name}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-800/80 text-white pl-12 pr-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

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
                  placeholder="Create a password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={credentials.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`w-full bg-gray-800/80 text-white pl-12 pr-12 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:border-transparent transition-all ${credentials.confirmPassword && !passwordsMatch
                      ? 'border-red-500 focus:ring-red-500'
                      : 'focus:ring-green-500'
                    }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {credentials.confirmPassword && !passwordsMatch && (
                <p className="mt-1 text-sm text-red-400">Passwords do not match</p>
              )}
            </div>

            {/* <div className="flex items-center">
              <input
                type="checkbox"
                id="terms"
                required
                className="w-4 h-4 text-green-500 bg-gray-800 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                I agree to the{' '}
                <button type="button" className="text-green-400 hover:text-green-300 transition-colors">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-green-400 hover:text-green-300 transition-colors">
                  Privacy Policy
                </button>
              </label>
            </div> */}

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-semibold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-glow transform hover:scale-105"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={onToggleMode}
                className="text-green-400 hover:text-green-300 transition-colors font-medium"
              >
                Sign in
              </button>
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

export default RegisterForm;