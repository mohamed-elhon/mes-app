import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input, Button, Checkbox, Alert } from '../ui';
import { useForm } from '../../hooks';
import { validateEmail } from '../../utils/helpers';
import Toast from '../ui/Toast';

const LoginForm = () => {
  const { login, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Form validation
  const validate = (values) => {
    const errors = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (values.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    return errors;
  };

  // Form submission
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldValue } = useForm(
    { email: '', password: '' },
    validate
  );

  // Handle form submission
  const onSubmit = async () => {
    try {
      await login(values.email, values.password, rememberMe);
      
      // Check if there's a redirect location
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      
      Toast.success('Login successful!');
    } catch (error) {
      Toast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  // Toggle remember me
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(onSubmit);
    }} className="space-y-6">
      {/* Email */}
      <Input
        type="email"
        name="email"
        value={values.email}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your email"
        label="Email"
        leftIcon={Mail}
        error={touched.email ? errors.email : ''}
        disabled={isSubmitting || authLoading}
        required
      />

      {/* Password */}
      <Input
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your password"
        label="Password"
        leftIcon={Lock}
        rightIcon={showPassword ? EyeOff : Eye}
        showPasswordToggle
        error={touched.password ? errors.password : ''}
        disabled={isSubmitting || authLoading}
        required
      />

      {/* Remember me and Forgot password */}
      <div className="flex-between">
        <Checkbox
          name="rememberMe"
          checked={rememberMe}
          onChange={toggleRememberMe}
          label="Remember me"
          disabled={isSubmitting || authLoading}
        />
        
        <Link
          to="/forgot-password"
          className="text-sm text-primary-600 hover:text-primary-700 transition-colors duration-200"
        >
          Forgot password?
        </Link>
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting || authLoading}
        disabled={isSubmitting || authLoading}
      >
        {isSubmitting || authLoading ? 'Logging in...' : 'Login'}
      </Button>

      {/* Sign up link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Don't have an account?{' '}
        <Link
          to="/register"
          className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
