import { useState, useCallback } from 'react';

const useForm = (initialValues = {}, validate = () => ({})) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);

  // Handle change
  const handleChange = useCallback((e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : 
                      type === 'file' ? files : 
                      value;

    setValues(prev => ({
      ...prev,
      [name]: inputValue
    }));
  }, []);

  // Handle blur
  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    // Validate field on blur
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    setIsValid(Object.keys(fieldErrors).length === 0);
  }, [values, validate]);

  // Validate form
  const validateForm = useCallback(() => {
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    setIsValid(Object.keys(fieldErrors).length === 0);
    return Object.keys(fieldErrors).length === 0;
  }, [values, validate]);

  // Handle submit
  const handleSubmit = useCallback(async (callback) => {
    setIsSubmitting(true);
    
    // Touch all fields
    const allFields = Object.keys(values);
    setTouched(prev => ({
      ...prev,
      ...allFields.reduce((acc, field) => ({
        ...acc,
        [field]: true
      }), {})
    }));
    
    // Validate
    const fieldErrors = validate(values);
    setErrors(fieldErrors);
    
    if (Object.keys(fieldErrors).length === 0) {
      try {
        await callback(values);
      } catch (error) {
        // Handle error
      }
    }
    
    setIsSubmitting(false);
  }, [values, validate]);

  // Set field value
  const setFieldValue = useCallback((name, value) => {
    setValues(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  // Set field error
  const setFieldError = useCallback((name, error) => {
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
    setIsValid(false);
  }, [initialValues]);

  // Get field props
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: handleChange,
    onBlur: handleBlur,
    error: touched[name] ? errors[name] : undefined,
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateForm,
    setFieldValue,
    setFieldError,
    resetForm,
    getFieldProps,
  };
};

export default useForm;
