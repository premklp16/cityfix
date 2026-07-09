export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { valid: false, message: 'Email is required' };
  if (!re.test(String(email).toLowerCase())) {
    return { valid: false, message: 'Invalid email address' };
  }
  return { valid: true, message: '' };
};

export const validatePassword = (password) => {
  if (!password) return { valid: false, message: 'Password is required' };
  if (password.length < 6) return { valid: false, message: 'Password must be at least 6 characters' };
  return { valid: true, message: '' };
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (value === undefined || value === null || String(value).trim() === '') {
    return { valid: false, message: `${fieldName} is required` };
  }
  return { valid: true, message: '' };
};

export const validateMinLength = (value, min, fieldName = 'Field') => {
  if (!value || String(value).length < min) {
    return { valid: false, message: `${fieldName} must be at least ${min} characters` };
  }
  return { valid: true, message: '' };
};

export const validateMaxLength = (value, max, fieldName = 'Field') => {
  if (value && String(value).length > max) {
    return { valid: false, message: `${fieldName} cannot exceed ${max} characters` };
  }
  return { valid: true, message: '' };
};
