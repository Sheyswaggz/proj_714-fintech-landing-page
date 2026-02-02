/**
 * Contact Form Validation and State Management
 * Handles form validation, loading states, and submission
 */

(function() {
  'use strict';

  // Form elements
  const form = document.querySelector('.contact-form');
  const nameInput = document.getElementById('name');
  const emailInput = document.getElementById('email');
  const companyInput = document.getElementById('company');
  const messageInput = document.getElementById('message');
  const submitButton = form?.querySelector('button[type="submit"]');

  // Validation patterns
  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const MIN_NAME_LENGTH = 2;
  const MAX_NAME_LENGTH = 100;
  const MIN_MESSAGE_LENGTH = 10;
  const MAX_MESSAGE_LENGTH = 1000;

  // Form state
  let formState = {
    isSubmitting: false,
    isSuccess: false,
    errors: {}
  };

  /**
   * Initialize form validation and event listeners
   */
  function initForm() {
    if (!form) {
      console.warn('Contact form not found');
      return;
    }

    // Real-time validation on blur
    nameInput?.addEventListener('blur', () => validateField('name'));
    emailInput?.addEventListener('blur', () => validateField('email'));
    messageInput?.addEventListener('blur', () => validateField('message'));

    // Real-time validation on input (debounced)
    let validationTimeout;
    [nameInput, emailInput, messageInput].forEach(input => {
      input?.addEventListener('input', () => {
        clearTimeout(validationTimeout);
        validationTimeout = setTimeout(() => {
          validateField(input.name);
        }, 500);
      });
    });

    // Form submission
    form.addEventListener('submit', handleFormSubmit);
  }

  /**
   * Validate a single form field
   * @param {string} fieldName - Name of the field to validate
   * @returns {boolean} - Whether the field is valid
   */
  function validateField(fieldName) {
    let isValid = true;
    let errorMessage = '';

    switch (fieldName) {
      case 'name':
        const nameValue = nameInput?.value.trim() || '';
        if (!nameValue) {
          isValid = false;
          errorMessage = 'Name is required';
        } else if (nameValue.length < MIN_NAME_LENGTH) {
          isValid = false;
          errorMessage = `Name must be at least ${MIN_NAME_LENGTH} characters`;
        } else if (nameValue.length > MAX_NAME_LENGTH) {
          isValid = false;
          errorMessage = `Name must not exceed ${MAX_NAME_LENGTH} characters`;
        }
        break;

      case 'email':
        const emailValue = emailInput?.value.trim() || '';
        if (!emailValue) {
          isValid = false;
          errorMessage = 'Email is required';
        } else if (!EMAIL_PATTERN.test(emailValue)) {
          isValid = false;
          errorMessage = 'Please enter a valid email address';
        }
        break;

      case 'message':
        const messageValue = messageInput?.value.trim() || '';
        if (!messageValue) {
          isValid = false;
          errorMessage = 'Message is required';
        } else if (messageValue.length < MIN_MESSAGE_LENGTH) {
          isValid = false;
          errorMessage = `Message must be at least ${MIN_MESSAGE_LENGTH} characters`;
        } else if (messageValue.length > MAX_MESSAGE_LENGTH) {
          isValid = false;
          errorMessage = `Message must not exceed ${MAX_MESSAGE_LENGTH} characters`;
        }
        break;
    }

    // Update error state
    if (isValid) {
      delete formState.errors[fieldName];
      removeFieldError(fieldName);
    } else {
      formState.errors[fieldName] = errorMessage;
      showFieldError(fieldName, errorMessage);
    }

    return isValid;
  }

  /**
   * Validate all required form fields
   * @returns {boolean} - Whether the entire form is valid
   */
  function validateForm() {
    const nameValid = validateField('name');
    const emailValid = validateField('email');
    const messageValid = validateField('message');

    return nameValid && emailValid && messageValid;
  }

  /**
   * Show error message for a field
   * @param {string} fieldName - Name of the field
   * @param {string} message - Error message to display
   */
  function showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove existing error
    removeFieldError(fieldName);

    // Add error class
    input.classList.add('error');
    input.setAttribute('aria-invalid', 'true');

    // Create and insert error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.setAttribute('role', 'alert');
    errorElement.textContent = message;
    formGroup.appendChild(errorElement);
  }

  /**
   * Remove error message for a field
   * @param {string} fieldName - Name of the field
   */
  function removeFieldError(fieldName) {
    const input = document.getElementById(fieldName);
    if (!input) return;

    const formGroup = input.closest('.form-group');
    if (!formGroup) return;

    // Remove error class
    input.classList.remove('error');
    input.removeAttribute('aria-invalid');

    // Remove error message
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Set form loading state
   * @param {boolean} isLoading - Whether the form is loading
   */
  function setFormLoadingState(isLoading) {
    formState.isSubmitting = isLoading;

    if (!submitButton) return;

    if (isLoading) {
      submitButton.disabled = true;
      submitButton.classList.add('loading');
      submitButton.textContent = 'Sending...';
      form?.classList.add('submitting');
    } else {
      submitButton.disabled = false;
      submitButton.classList.remove('loading');
      submitButton.textContent = 'Send Message';
      form?.classList.remove('submitting');
    }
  }

  /**
   * Show success message
   */
  function showSuccessMessage() {
    formState.isSuccess = true;

    // Remove any existing messages
    removeFormMessage();

    // Create success message
    const successElement = document.createElement('div');
    successElement.className = 'form-message form-success';
    successElement.setAttribute('role', 'status');
    successElement.setAttribute('aria-live', 'polite');
    successElement.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <div>
        <strong>Thank you for your message!</strong>
        <p>We'll get back to you as soon as possible.</p>
      </div>
    `;

    // Insert success message before the form
    form?.parentElement?.insertBefore(successElement, form);

    // Focus on success message for screen readers
    successElement.focus();
  }

  /**
   * Show error message
   * @param {string} message - Error message to display
   */
  function showErrorMessage(message = 'Something went wrong. Please try again.') {
    // Remove any existing messages
    removeFormMessage();

    // Create error message
    const errorElement = document.createElement('div');
    errorElement.className = 'form-message form-error';
    errorElement.setAttribute('role', 'alert');
    errorElement.setAttribute('aria-live', 'assertive');
    errorElement.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <div>
        <strong>Error</strong>
        <p>${message}</p>
      </div>
    `;

    // Insert error message before the form
    form?.parentElement?.insertBefore(errorElement, form);

    // Focus on error message for screen readers
    errorElement.focus();
  }

  /**
   * Remove form messages
   */
  function removeFormMessage() {
    const messages = form?.parentElement?.querySelectorAll('.form-message');
    messages?.forEach(msg => msg.remove());
  }

  /**
   * Reset form to initial state
   */
  function resetForm() {
    form?.reset();
    formState = {
      isSubmitting: false,
      isSuccess: false,
      errors: {}
    };

    // Remove all field errors
    ['name', 'email', 'message'].forEach(field => {
      removeFieldError(field);
    });

    // Remove form messages
    removeFormMessage();
  }

  /**
   * Simulate API call for form submission
   * @param {FormData} formData - Form data to submit
   * @returns {Promise} - Promise that resolves after simulated delay
   */
  async function submitFormData(formData) {
    // Simulate network delay (1-2 seconds)
    const delay = 1000 + Math.random() * 1000;

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulate 10% chance of error for testing
        if (Math.random() < 0.9) {
          resolve({
            success: true,
            message: 'Form submitted successfully'
          });
        } else {
          reject(new Error('Network error occurred'));
        }
      }, delay);
    });
  }

  /**
   * Handle form submission
   * @param {Event} event - Submit event
   */
  async function handleFormSubmit(event) {
    event.preventDefault();

    // Remove any existing messages
    removeFormMessage();

    // Validate form
    if (!validateForm()) {
      // Focus on first error field
      const firstErrorField = Object.keys(formState.errors)[0];
      if (firstErrorField) {
        document.getElementById(firstErrorField)?.focus();
      }
      return;
    }

    // Prevent double submission
    if (formState.isSubmitting) {
      return;
    }

    try {
      // Set loading state
      setFormLoadingState(true);

      // Collect form data
      const formData = new FormData(form);

      // Submit form data (simulated)
      await submitFormData(formData);

      // Show success message
      showSuccessMessage();

      // Reset form after short delay
      setTimeout(() => {
        resetForm();
      }, 5000);

    } catch (error) {
      console.error('Form submission error:', error);
      showErrorMessage(error.message || 'Unable to submit form. Please try again.');
    } finally {
      // Remove loading state
      setFormLoadingState(false);
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }

})();
