import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { Input, Button, Alert } from '../ui';
import { useForm } from '../../hooks';
import { validatePassword } from '../../utils/helpers';
import { apiCall } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import Toast from '../ui/Toast';

const ResetPasswordForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [isReset, setIsReset] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form validation
  const validate = (values) => {
    const errors = {};
    
    if (!values.password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(values.password)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    return errors;
  };

  // Form submission
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(
    { password: '', confirmPassword: '' },
    validate
  );

  // Handle form submission
  const onSubmit = async () => {
    if (!token) {
      Toast.error('Invalid or missing reset token');
      return;
    }

    try {
      await apiCall('put', API_ENDPOINTS.AUTH.RESET_PASSWORD.replace(':resetToken', token), {
        password: values.password
      });
      
      setIsReset(true);
      Toast.success('Password reset successful!');
    } catch (error) {
      Toast.error(error.message || 'Password reset failed. Please try again.');
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Check if token is valid
  React.useEffect(() => {
    if (!token) {
      Toast.error('Invalid or missing reset token');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  if (isReset) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Password Reset Successful
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          Your password has been successfully reset. You can now login with your new password.
        </p>
        
        <Button onClick={() => navigate('/login')} fullWidth>
          Continue to Login
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(onSubmit);
    }} className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
        Enter your new password below.
      </p>

      {/* Password */}
      <Input
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={values.password}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Enter your new password"
        label="New Password"
        leftIcon={Lock}
        rightIcon={showPassword ? EyeOff : Eye}
        showPasswordToggle
        error={touched.password ? errors.password : ''}
        disabled={isSubmitting}
        required
      />

      {/* Confirm Password */}
      <Input
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Confirm your new password"
        label="Confirm Password"
        leftIcon={Lock}
        rightIcon={showConfirmPassword ? EyeOff : Eye}
        showPasswordToggle
        error={touched.confirmPassword ? errors.confirmPassword : ''}
        disabled={isSubmitting}
        required
      />

      {/* Submit button */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Resetting...' : 'Reset Password'}
      </Button>

      {/* Login link */}
      <div className="text-center">
        <Link
          to="/login"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200 inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Link>
      </div>
    </form>
  );
};

export default ResetPasswordForm;
