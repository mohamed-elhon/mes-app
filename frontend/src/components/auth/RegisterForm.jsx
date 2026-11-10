import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { Input, Button, Checkbox, Alert } from '../ui';
import { useForm } from '../../hooks';
import { validateEmail, validatePassword } from '../../utils/helpers';
import Toast from '../ui/Toast';

const RegisterForm = () => {
  const { register, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Form validation
  const validate = (values) => {
    const errors = {};
    
    if (!values.firstName) {
      errors.firstName = 'First name is required';
    } else if (values.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!values.lastName) {
      errors.lastName = 'Last name is required';
    } else if (values.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!values.email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(values.email)) {
      errors.email = 'Please enter a valid email';
    }
    
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
    
    if (!termsAccepted) {
      errors.terms = 'You must accept the terms and conditions';
    }
    
    return errors;
  };

  // Form submission
  const { values, errors, touched, isSubmitting, handleChange, handleBlur, handleSubmit, setFieldValue } = useForm(
    { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' },
    validate
  );

  // Handle form submission
  const onSubmit = async () => {
    try {
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      };
      
      await register(userData);
      
      navigate('/');
      Toast.success('Registration successful! Please check your email for verification.');
    } catch (error) {
      Toast.error(error.message || 'Registration failed. Please try again.');
    }
  };

  // Toggle password visibility
  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Toggle terms acceptance
  const toggleTerms = () => {
    setTermsAccepted(!termsAccepted);
    // Trigger validation
    const fieldErrors = validate({ ...values, termsAccepted: !termsAccepted });
    if (!fieldErrors.terms) {
      // Remove terms error if it exists
      setFieldValue('terms', '');
    }
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit(onSubmit);
    }} className="space-y-6">
      {/* First Name and Last Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          type="text"
          name="firstName"
          value={values.firstName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your first name"
          label="First Name"
          leftIcon={User}
          error={touched.firstName ? errors.firstName : ''}
          disabled={isSubmitting || authLoading}
          required
        />
        
        <Input
          type="text"
          name="lastName"
          value={values.lastName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Enter your last name"
          label="Last Name"
          leftIcon={User}
          error={touched.lastName ? errors.lastName : ''}
          disabled={isSubmitting || authLoading}
          required
        />
      </div>

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

      {/* Confirm Password */}
      <Input
        type={showConfirmPassword ? 'text' : 'password'}
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="Confirm your password"
        label="Confirm Password"
        leftIcon={Lock}
        rightIcon={showConfirmPassword ? EyeOff : Eye}
        showPasswordToggle
        error={touched.confirmPassword ? errors.confirmPassword : ''}
        disabled={isSubmitting || authLoading}
        required
      />

      {/* Terms and Conditions */}
      <Checkbox
        name="terms"
        checked={termsAccepted}
        onChange={toggleTerms}
        label={
          <span>
            I accept the{' '}
            <Link
              to="/terms"
              className="text-primary-600 hover:text-primary-700"
            >
              Terms and Conditions
            </Link>
          </span>
        }
        error={errors.terms}
        disabled={isSubmitting || authLoading}
      />

      {/* Submit button */}
      <Button
        type="submit"
        fullWidth
        size="lg"
        loading={isSubmitting || authLoading}
        disabled={isSubmitting || authLoading}
      >
        {isSubmitting || authLoading ? 'Registering...' : 'Register'}
      </Button>

      {/* Login link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
        >
          Login
        </Link>
      </p>
    </form>
  );
};

export default RegisterForm;
