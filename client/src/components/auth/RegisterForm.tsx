import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from 'lucide-react';
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
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
        <p className="text-gray-400">Join us to manage your finances</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-500 text-sm">{error}</p>
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
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full bg-gray-800 text-white pl-12 pr-4 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className="w-full bg-gray-800 text-white pl-12 pr-12 py-3 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              className={`w-full bg-gray-800 text-white pl-12 pr-12 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:border-transparent ${
                credentials.confirmPassword && !passwordsMatch
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-700 focus:ring-green-500'
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
            <p className="mt-1 text-sm text-red-500">Passwords do not match</p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="terms"
            required
            className="w-4 h-4 text-green-500 bg-gray-800 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
            I agree to the{' '}
            <button type="button" className="text-green-500 hover:text-green-400 transition-colors">
              Terms of Service
            </button>{' '}
            and{' '}
            <button type="button" className="text-green-500 hover:text-green-400 transition-colors">
              Privacy Policy
            </button>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
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
            className="text-green-500 hover:text-green-400 transition-colors font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;