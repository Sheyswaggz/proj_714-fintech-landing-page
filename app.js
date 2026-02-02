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

  /**
   * Scroll-Triggered Reveal Animation with Intersection Observer
   * Implements staggered animations for sections as they enter viewport
   */
  class ScrollReveal {
    constructor() {
      this.elements = [];
      this.observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.15
      };

      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      console.log('ScrollReveal: Initialization started', {
        reducedMotion: this.reducedMotion,
        observerSupported: 'IntersectionObserver' in window
      });

      this.init();
    }

    init() {
      if (this.reducedMotion) {
        console.log('ScrollReveal: Reduced motion preferred, skipping animations');
        this.revealAllImmediately();
        return;
      }

      if (!('IntersectionObserver' in window)) {
        console.warn('ScrollReveal: IntersectionObserver not supported, revealing all elements');
        this.revealAllImmediately();
        return;
      }

      this.setupObserver();
      this.observeElements();
      console.log('ScrollReveal: Initialization complete');
    }

    setupObserver() {
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.revealElement(entry.target);
            this.observer.unobserve(entry.target);
          }
        });
      }, this.observerOptions);
    }

    observeElements() {
      this.elements = Array.from(document.querySelectorAll('[data-reveal]'));

      console.log(`ScrollReveal: Found ${this.elements.length} elements to observe`);

      this.elements.forEach((element) => {
        this.observer.observe(element);
      });
    }

    revealElement(element) {
      requestAnimationFrame(() => {
        element.classList.add('revealed');
        console.log('ScrollReveal: Element revealed', {
          tag: element.tagName,
          class: element.className
        });
      });
    }

    revealAllImmediately() {
      const elements = document.querySelectorAll('[data-reveal]');
      elements.forEach((element) => {
        element.classList.add('revealed');
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      });
      console.log(`ScrollReveal: Revealed ${elements.length} elements immediately`);
    }

    destroy() {
      if (this.observer) {
        this.observer.disconnect();
        console.log('ScrollReveal: Observer disconnected');
      }
    }
  }

  /**
   * Button Morphing Interactions and Smooth Scroll Behavior
   * Handles CTA button states and smooth scrolling for navigation
   */
  class ButtonMorphing {
    constructor() {
      this.buttons = [];
      this.buttonStates = new WeakMap();

      console.log('ButtonMorphing: Initialization started');
      this.init();
    }

    init() {
      this.setupButtons();
      this.setupSmoothScroll();
      console.log('ButtonMorphing: Initialization complete');
    }

    setupButtons() {
      this.buttons = Array.from(document.querySelectorAll('.cta-button'));

      console.log(`ButtonMorphing: Found ${this.buttons.length} CTA buttons`);

      this.buttons.forEach((button) => {
        this.initializeButton(button);
      });
    }

    initializeButton(button) {
      this.buttonStates.set(button, {
        state: 'idle',
        originalText: button.textContent.trim()
      });

      button.addEventListener('mouseenter', () => this.handleHover(button));
      button.addEventListener('mouseleave', () => this.handleLeave(button));
      button.addEventListener('mousedown', () => this.handleActive(button));
      button.addEventListener('mouseup', () => this.handleRelease(button));
      button.addEventListener('click', (e) => this.handleClick(button, e));

      button.addEventListener('focus', () => {
        console.log('ButtonMorphing: Button focused', { text: button.textContent.trim() });
      });

      button.addEventListener('blur', () => {
        const state = this.buttonStates.get(button);
        if (state && state.state !== 'loading') {
          this.resetButton(button);
        }
      });
    }

    handleHover(button) {
      const state = this.buttonStates.get(button);
      if (!state || state.state === 'loading') return;

      console.log('ButtonMorphing: Button hover', { text: state.originalText });
      button.style.setProperty('--hover-scale', '1.02');
    }

    handleLeave(button) {
      const state = this.buttonStates.get(button);
      if (!state || state.state === 'loading') return;

      button.style.removeProperty('--hover-scale');
    }

    handleActive(button) {
      const state = this.buttonStates.get(button);
      if (!state || state.state === 'loading') return;

      console.log('ButtonMorphing: Button active', { text: state.originalText });
    }

    handleRelease(button) {
      const state = this.buttonStates.get(button);
      if (!state || state.state === 'loading') return;

      console.log('ButtonMorphing: Button released', { text: state.originalText });
    }

    handleClick(button, event) {
      const state = this.buttonStates.get(button);
      if (!state) return;

      if (state.state === 'loading') {
        event.preventDefault();
        console.log('ButtonMorphing: Click ignored, button in loading state');
        return;
      }

      const href = button.getAttribute('href');
      if (href && href.startsWith('#')) {
        event.preventDefault();
        this.smoothScrollTo(href);
      }

      console.log('ButtonMorphing: Button clicked', {
        text: state.originalText,
        href: href || 'none'
      });
    }

    setLoadingState(button) {
      const state = this.buttonStates.get(button);
      if (!state) return;

      state.state = 'loading';
      button.disabled = true;
      button.setAttribute('aria-busy', 'true');

      const buttonText = button.querySelector('.button-text');
      if (buttonText) {
        buttonText.style.opacity = '0.5';
      }

      const spinner = button.querySelector('.button-spinner');
      if (spinner) {
        spinner.style.display = 'block';
      }

      console.log('ButtonMorphing: Button loading state set', { text: state.originalText });
    }

    setSuccessState(button) {
      const state = this.buttonStates.get(button);
      if (!state) return;

      state.state = 'success';
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');

      const buttonText = button.querySelector('.button-text');
      if (buttonText) {
        buttonText.textContent = 'Success!';
        buttonText.style.opacity = '1';
      }

      const spinner = button.querySelector('.button-spinner');
      if (spinner) {
        spinner.style.display = 'none';
      }

      console.log('ButtonMorphing: Button success state set', { text: state.originalText });

      setTimeout(() => {
        this.resetButton(button);
      }, 2000);
    }

    resetButton(button) {
      const state = this.buttonStates.get(button);
      if (!state) return;

      state.state = 'idle';
      button.disabled = false;
      button.setAttribute('aria-busy', 'false');

      const buttonText = button.querySelector('.button-text');
      if (buttonText) {
        buttonText.textContent = state.originalText;
        buttonText.style.opacity = '1';
      }

      const spinner = button.querySelector('.button-spinner');
      if (spinner) {
        spinner.style.display = 'none';
      }

      console.log('ButtonMorphing: Button reset to idle', { text: state.originalText });
    }

    setupSmoothScroll() {
      const navLinks = document.querySelectorAll('a[href^="#"]');

      console.log(`ButtonMorphing: Setting up smooth scroll for ${navLinks.length} links`);

      navLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
          const href = link.getAttribute('href');
          if (href && href !== '#' && href.startsWith('#')) {
            e.preventDefault();
            this.smoothScrollTo(href);
          }
        });
      });
    }

    smoothScrollTo(target) {
      const element = document.querySelector(target);

      if (!element) {
        console.warn(`ButtonMorphing: Smooth scroll target not found: ${target}`);
        return;
      }

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reducedMotion) {
        element.scrollIntoView();
        console.log('ButtonMorphing: Instant scroll (reduced motion)', { target });
      } else {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        console.log('ButtonMorphing: Smooth scroll initiated', { target });
      }

      if (element.hasAttribute('tabindex')) {
        element.focus();
      } else {
        element.setAttribute('tabindex', '-1');
        element.focus();
        element.addEventListener('blur', () => {
          element.removeAttribute('tabindex');
        }, { once: true });
      }
    }
  }

  /**
   * Skeleton Loading for Testimonial Images
   * Implements loading placeholders for async image loading
   */
  class SkeletonLoading {
    constructor() {
      this.images = [];
      console.log('SkeletonLoading: Initialization started');
      this.init();
    }

    init() {
      this.setupTestimonialImages();
      console.log('SkeletonLoading: Initialization complete');
    }

    setupTestimonialImages() {
      const testimonialImages = document.querySelectorAll('.testimonial-photo img');

      console.log(`SkeletonLoading: Found ${testimonialImages.length} testimonial images`);

      testimonialImages.forEach((img) => {
        this.setupImageLoading(img);
      });
    }

    setupImageLoading(img) {
      const container = img.closest('.testimonial-photo');
      if (!container) return;

      if (!img.complete || img.naturalHeight === 0) {
        this.showSkeleton(container, img);

        img.addEventListener('load', () => {
          this.hideSkeleton(container, img);
        });

        img.addEventListener('error', () => {
          this.handleImageError(container, img);
        });
      } else {
        console.log('SkeletonLoading: Image already loaded', { src: img.src });
      }
    }

    showSkeleton(container, img) {
      container.classList.add('loading');
      img.style.opacity = '0';

      console.log('SkeletonLoading: Skeleton shown', { src: img.src });
    }

    hideSkeleton(container, img) {
      setTimeout(() => {
        container.classList.remove('loading');
        img.style.opacity = '1';

        console.log('SkeletonLoading: Image loaded, skeleton hidden', { src: img.src });
      }, 200);
    }

    handleImageError(container, img) {
      container.classList.remove('loading');
      img.style.opacity = '0.3';
      img.alt = `${img.alt} (failed to load)`;

      console.error('SkeletonLoading: Image failed to load', { src: img.src });
    }
  }

  /**
   * Initialize all interactive features
   */
  function initializeInteractions() {
    console.log('Application: DOM ready, initializing all features');

    const formElement = document.querySelector('.contact-form');
    if (formElement) {
      new ContactForm(formElement);
      console.log('Application: ContactForm initialized');
    } else {
      console.warn('Application: Contact form element not found');
    }

    const scrollReveal = new ScrollReveal();
    console.log('Application: ScrollReveal initialized');

    const buttonMorphing = new ButtonMorphing();
    console.log('Application: ButtonMorphing initialized');

    const skeletonLoading = new SkeletonLoading();
    console.log('Application: SkeletonLoading initialized');

    console.log('Application: All features initialized successfully');

    window.addEventListener('beforeunload', () => {
      if (scrollReveal) {
        scrollReveal.destroy();
      }
      console.log('Application: Cleanup completed');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeInteractions);
  } else {
    initializeInteractions();
  }

})();
