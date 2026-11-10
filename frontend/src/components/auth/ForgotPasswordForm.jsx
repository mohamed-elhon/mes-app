import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { Input, Button, Alert } from '../ui';
import { useForm } from '../../hooks';
import { validateEmail } from '../../utils/helpers';
import { apiCall } from '../../utils/api';
import { API_ENDPOINTS } from '../../utils/constants';
import Toast from '../ui/Toast';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  const [isSent, setIsSent] = React.useState(false);

  // Form validation
  const validate = (values) => {
    const errors = {};
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Please enter a valid email';
    }
    
    return errors;
  };

  // Form submission
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit } = useForm(
    { email: '' },
    validate
  );

  // Handle form submission
  const onSubmit = async () => {
    try {
      await apiCall('post', API_ENDPOINTS.AUTH.FORGOT_PASSWORD, {
        email: values.email
      });
      
      setIsSent(true);
      Toast.success('Password reset link sent to your email!');
    } catch (error) {
      Toast.error(error.message || 'Failed to send password reset link. Please try again.');
    }
  };

  if (isSent) {
    return (
      <div className="text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Mail className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Check Your Email
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400">
          We've sent a password reset link to <span className="font-medium text-primary-600">{values.email}</span>.
          Please check your inbox and follow the instructions.
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setIsSent(false)}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            try again
          </button>
        </p>
        
        <Button onClick={() => navigate('/login')} variant="outline" fullWidth>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Login
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
        Enter your email address and we'll send you a link to reset your password.
      </p>

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
        {isSubmitting ? 'Sending...' : 'Send Reset Link'}
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

export default ForgotPasswordForm;
