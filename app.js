/**
 * Contact Form Validation and State Management
 * Handles real-time validation, form submission, loading states, and user feedback
 */

(function() {
  'use strict';

  const FormState = {
    IDLE: 'idle',
    VALIDATING: 'validating',
    SUBMITTING: 'submitting',
    SUCCESS: 'success',
    ERROR: 'error'
  };

  class ContactForm {
    constructor(formElement) {
      if (!formElement) {
        console.error('ContactForm: Form element not provided');
        return;
      }

      this.form = formElement;
      this.state = FormState.IDLE;
      this.fields = {
        name: this.form.querySelector('#name'),
        email: this.form.querySelector('#email'),
        company: this.form.querySelector('#company'),
        phone: this.form.querySelector('#phone'),
        inquiryType: this.form.querySelector('#inquiry-type'),
        message: this.form.querySelector('#message'),
        consent: this.form.querySelector('#consent')
      };
      this.submitButton = this.form.querySelector('button[type="submit"]');
      this.stateContainers = {
        loading: document.getElementById('form-loading'),
        success: document.getElementById('form-success'),
        error: document.getElementById('form-error')
      };

      this.validationRules = {
        name: {
          required: true,
          minLength: 2,
          maxLength: 100,
          pattern: /^[a-zA-Z\s'-]+$/,
          message: 'Please enter a valid name (2-100 characters, letters only)'
        },
        email: {
          required: true,
          pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'Please enter a valid email address'
        },
        phone: {
          required: false,
          pattern: /^[\d\s+()-]*$/,
          minLength: 10,
          message: 'Please enter a valid phone number (at least 10 digits)'
        },
        inquiryType: {
          required: true,
          message: 'Please select an inquiry type'
        },
        message: {
          required: true,
          minLength: 10,
          maxLength: 1000,
          message: 'Please enter a message (10-1000 characters)'
        },
        consent: {
          required: true,
          message: 'You must agree to the privacy policy and terms of service'
        }
      };

      this.init();
    }

    init() {
      console.log('ContactForm: Initializing form validation');
      this.bindEvents();
      this.setupAccessibility();
    }

    bindEvents() {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));

      Object.keys(this.fields).forEach(fieldName => {
        const field = this.fields[fieldName];
        if (field) {
          field.addEventListener('blur', () => this.validateField(fieldName));
          field.addEventListener('input', () => this.clearFieldError(fieldName));

          if (fieldName === 'email') {
            field.addEventListener('input', () => this.debounceValidation(fieldName));
          }
        }
      });

      console.log('ContactForm: Event listeners attached');
    }

    setupAccessibility() {
      Object.keys(this.fields).forEach(fieldName => {
        const field = this.fields[fieldName];
        if (field) {
          field.setAttribute('aria-invalid', 'false');
        }
      });
    }

    validateField(fieldName) {
      const field = this.fields[fieldName];
      const rules = this.validationRules[fieldName];

      if (!field || !rules) {
        return true;
      }

      const value = field.type === 'checkbox' ? field.checked : field.value.trim();
      const errorElement = this.form.querySelector(`#${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}-error`);

      if (rules.required && !value) {
        this.showFieldError(field, errorElement, rules.message || 'This field is required');
        return false;
      }

      if (value) {
        if (rules.minLength && value.length < rules.minLength) {
          this.showFieldError(field, errorElement, rules.message || `Minimum ${rules.minLength} characters required`);
          return false;
        }

        if (rules.maxLength && value.length > rules.maxLength) {
          this.showFieldError(field, errorElement, rules.message || `Maximum ${rules.maxLength} characters allowed`);
          return false;
        }

        if (rules.pattern && !rules.pattern.test(value)) {
          this.showFieldError(field, errorElement, rules.message);
          return false;
        }
      }

      this.clearFieldError(fieldName);
      this.markFieldValid(field);
      return true;
    }

    showFieldError(field, errorElement, message) {
      if (!field) return;

      field.classList.add('error');
      field.classList.remove('success');
      field.setAttribute('aria-invalid', 'true');

      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }

      console.log(`ContactForm: Validation error - ${field.name}: ${message}`);
    }

    clearFieldError(fieldName) {
      const field = this.fields[fieldName];
      if (!field) return;

      const errorElement = this.form.querySelector(`#${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}-error`);

      field.classList.remove('error');
      field.setAttribute('aria-invalid', 'false');

      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    }

    markFieldValid(field) {
      if (!field) return;

      field.classList.remove('error');
      field.classList.add('success', 'validated');
      field.setAttribute('aria-invalid', 'false');
    }

    debounceValidation(fieldName) {
      if (this.validationTimeout) {
        clearTimeout(this.validationTimeout);
      }

      this.validationTimeout = setTimeout(() => {
        const field = this.fields[fieldName];
        if (field && field.value.trim()) {
          this.validateField(fieldName);
        }
      }, 500);
    }

    validateAllFields() {
      console.log('ContactForm: Validating all fields');
      let isValid = true;

      Object.keys(this.validationRules).forEach(fieldName => {
        if (!this.validateField(fieldName)) {
          isValid = false;
        }
      });

      return isValid;
    }

    async handleSubmit(e) {
      e.preventDefault();

      console.log('ContactForm: Form submission initiated');

      if (this.state === FormState.SUBMITTING) {
        console.log('ContactForm: Already submitting, ignoring duplicate submission');
        return;
      }

      if (!this.validateAllFields()) {
        console.log('ContactForm: Validation failed');
        this.focusFirstError();
        return;
      }

      try {
        await this.submitForm();
      } catch (error) {
        console.error('ContactForm: Submission error:', error);
        this.setState(FormState.ERROR);
        this.showErrorMessage('An unexpected error occurred. Please try again.');
      }
    }

    async submitForm() {
      this.setState(FormState.SUBMITTING);
      this.disableForm();
      this.hideAllStateMessages();
      this.showLoadingState();

      console.log('ContactForm: Submitting form data');

      const formData = this.getFormData();
      console.log('ContactForm: Form data collected', formData);

      try {
        const response = await this.simulateAPICall(formData);

        if (response.success) {
          console.log('ContactForm: Submission successful');
          this.setState(FormState.SUCCESS);
          this.showSuccessMessage();
          this.resetForm();
        } else {
          console.error('ContactForm: Submission failed', response.error);
          this.setState(FormState.ERROR);
          this.showErrorMessage(response.error || 'Submission failed. Please try again.');
        }
      } catch (error) {
        console.error('ContactForm: Network error', error);
        this.setState(FormState.ERROR);
        this.showErrorMessage('Network error. Please check your connection and try again.');
      } finally {
        this.hideLoadingState();
        this.enableForm();
      }
    }

    simulateAPICall(formData) {
      return new Promise((resolve) => {
        console.log('ContactForm: Simulating API call with 2s delay');

        setTimeout(() => {
          const success = Math.random() > 0.1;

          resolve({
            success: success,
            error: success ? null : 'Server error. Please try again later.'
          });
        }, 2000);
      });
    }

    getFormData() {
      return {
        name: this.fields.name?.value.trim() || '',
        email: this.fields.email?.value.trim() || '',
        company: this.fields.company?.value.trim() || '',
        phone: this.fields.phone?.value.trim() || '',
        inquiryType: this.fields.inquiryType?.value || '',
        message: this.fields.message?.value.trim() || '',
        consent: this.fields.consent?.checked || false,
        timestamp: new Date().toISOString()
      };
    }

    setState(newState) {
      console.log(`ContactForm: State change ${this.state} -> ${newState}`);
      this.state = newState;
    }

    disableForm() {
      Object.values(this.fields).forEach(field => {
        if (field) {
          field.disabled = true;
        }
      });

      if (this.submitButton) {
        this.submitButton.disabled = true;
        this.submitButton.setAttribute('aria-busy', 'true');
      }
    }

    enableForm() {
      Object.values(this.fields).forEach(field => {
        if (field) {
          field.disabled = false;
        }
      });

      if (this.submitButton) {
        this.submitButton.disabled = false;
        this.submitButton.setAttribute('aria-busy', 'false');
      }
    }

    showLoadingState() {
      if (this.stateContainers.loading) {
        this.stateContainers.loading.style.display = 'flex';
      }
    }

    hideLoadingState() {
      if (this.stateContainers.loading) {
        this.stateContainers.loading.style.display = 'none';
      }
    }

    showSuccessMessage() {
      if (this.stateContainers.success) {
        this.stateContainers.success.style.display = 'flex';

        setTimeout(() => {
          if (this.stateContainers.success) {
            this.stateContainers.success.style.display = 'none';
          }
        }, 8000);
      }
    }

    showErrorMessage(message) {
      if (this.stateContainers.error) {
        const messageElement = this.stateContainers.error.querySelector('span:last-child');
        if (messageElement) {
          messageElement.textContent = message;
        }
        this.stateContainers.error.style.display = 'flex';

        setTimeout(() => {
          if (this.stateContainers.error) {
            this.stateContainers.error.style.display = 'none';
          }
        }, 8000);
      }
    }

    hideAllStateMessages() {
      Object.values(this.stateContainers).forEach(container => {
        if (container) {
          container.style.display = 'none';
        }
      });
    }

    resetForm() {
      console.log('ContactForm: Resetting form');

      this.form.reset();

      Object.keys(this.fields).forEach(fieldName => {
        const field = this.fields[fieldName];
        if (field) {
          field.classList.remove('error', 'success', 'validated');
          field.setAttribute('aria-invalid', 'false');
        }
        this.clearFieldError(fieldName);
      });

      this.setState(FormState.IDLE);
    }

    focusFirstError() {
      const firstErrorField = this.form.querySelector('.error');
      if (firstErrorField) {
        firstErrorField.focus();
        console.log('ContactForm: Focused first error field');
      }
    }
  }

  function initializeForm() {
    console.log('ContactForm: DOM ready, initializing');

    const formElement = document.querySelector('.contact-form');

    if (formElement) {
      new ContactForm(formElement);
      console.log('ContactForm: Initialization complete');
    } else {
      console.warn('ContactForm: Form element not found');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeForm);
  } else {
    initializeForm();
  }

})();
