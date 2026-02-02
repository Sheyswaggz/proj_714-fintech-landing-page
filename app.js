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

/**
 * Scroll-Triggered Reveal Animations
 * Implements Intersection Observer for revealing sections as they scroll into view
 * with staggered timing and accessibility support
 */

(function() {
  'use strict';

  // Configuration
  const REVEAL_CONFIG = {
    threshold: 0.15,
    rootMargin: '0px 0px -100px 0px',
    staggerDelay: 125 // 125ms between elements
  };

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Initialize scroll reveal animations
   */
  function initScrollReveal() {
    // Skip animations if user prefers reduced motion
    if (prefersReducedMotion) {
      // Remove hidden class from all reveal elements immediately
      const allRevealElements = document.querySelectorAll('[data-reveal]');
      allRevealElements.forEach(element => {
        element.removeAttribute('data-reveal');
      });
      return;
    }

    // Check for Intersection Observer support
    if (!('IntersectionObserver' in window)) {
      // Fallback: reveal all elements immediately
      revealAllElements();
      return;
    }

    // Create observer for section reveals
    const revealObserver = new IntersectionObserver(handleIntersection, {
      threshold: REVEAL_CONFIG.threshold,
      rootMargin: REVEAL_CONFIG.rootMargin
    });

    // Observe hero section
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
      heroSection.setAttribute('data-reveal', 'true');
      revealObserver.observe(heroSection);
    }

    // Observe services section and individual service cards
    const servicesSection = document.querySelector('.services');
    if (servicesSection) {
      servicesSection.setAttribute('data-reveal', 'true');
      revealObserver.observe(servicesSection);

      const serviceCards = servicesSection.querySelectorAll('.service-card');
      serviceCards.forEach((card, index) => {
        card.setAttribute('data-reveal', 'true');
        card.setAttribute('data-reveal-delay', index);
        revealObserver.observe(card);
      });
    }

    // Observe trust section and its subsections
    const trustSection = document.querySelector('.trust');
    if (trustSection) {
      trustSection.setAttribute('data-reveal', 'true');
      revealObserver.observe(trustSection);

      // Observe trust stats
      const trustStats = trustSection.querySelectorAll('.stat-item');
      trustStats.forEach((stat, index) => {
        stat.setAttribute('data-reveal', 'true');
        stat.setAttribute('data-reveal-delay', index);
        revealObserver.observe(stat);
      });

      // Observe trust badges
      const trustBadges = trustSection.querySelectorAll('.badge-item');
      trustBadges.forEach((badge, index) => {
        badge.setAttribute('data-reveal', 'true');
        badge.setAttribute('data-reveal-delay', index);
        revealObserver.observe(badge);
      });
    }

    // Observe testimonials section and individual testimonial cards
    const testimonialsSection = document.querySelector('.testimonials');
    if (testimonialsSection) {
      testimonialsSection.setAttribute('data-reveal', 'true');
      revealObserver.observe(testimonialsSection);

      const testimonialCards = testimonialsSection.querySelectorAll('.testimonial-card');
      testimonialCards.forEach((card, index) => {
        card.setAttribute('data-reveal', 'true');
        card.setAttribute('data-reveal-delay', index);
        revealObserver.observe(card);
      });
    }

    // Observe contact section
    const contactSection = document.querySelector('.contact');
    if (contactSection) {
      contactSection.setAttribute('data-reveal', 'true');
      revealObserver.observe(contactSection);
    }
  }

  /**
   * Handle intersection events
   * @param {IntersectionObserverEntry[]} entries - Intersection observer entries
   * @param {IntersectionObserver} observer - The observer instance
   */
  function handleIntersection(entries, observer) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const delay = element.getAttribute('data-reveal-delay');
        const delayMs = delay ? parseInt(delay) * REVEAL_CONFIG.staggerDelay : 0;

        // Apply reveal with stagger delay
        setTimeout(() => {
          element.setAttribute('data-reveal', 'visible');
          element.removeAttribute('data-reveal-delay');
        }, delayMs);

        // Stop observing this element
        observer.unobserve(element);
      }
    });
  }

  /**
   * Fallback: Reveal all elements immediately
   * Used when IntersectionObserver is not supported
   */
  function revealAllElements() {
    const sections = [
      '.hero',
      '.services',
      '.trust',
      '.testimonials',
      '.contact'
    ];

    sections.forEach(selector => {
      const section = document.querySelector(selector);
      if (section) {
        section.setAttribute('data-reveal', 'visible');
      }
    });

    // Reveal all cards and items
    const revealableElements = document.querySelectorAll(
      '.service-card, .stat-item, .badge-item, .testimonial-card'
    );
    revealableElements.forEach(element => {
      element.setAttribute('data-reveal', 'visible');
    });
  }

  /**
   * Initialize smooth scroll behavior for navigation links
   */
  function initSmoothScroll() {
    // Skip smooth scroll if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
      link.addEventListener('click', function(e) {
        const href = this.getAttribute('href');

        // Skip if it's just "#" or empty
        if (!href || href === '#') return;

        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();

          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Update URL without triggering scroll
          if (history.pushState) {
            history.pushState(null, null, href);
          }

          // Focus target element for accessibility
          targetElement.setAttribute('tabindex', '-1');
          targetElement.focus();
        }
      });
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initScrollReveal();
      initSmoothScroll();
    });
  } else {
    initScrollReveal();
    initSmoothScroll();
  }

})();

/**
 * Button Morphing Interactions
 * Implements morphing button effects with state management for CTAs
 * Handles hover, active, loading, and success states
 */

(function() {
  'use strict';

  // Button states
  const BUTTON_STATES = {
    DEFAULT: 'default',
    HOVER: 'hover',
    ACTIVE: 'active',
    LOADING: 'loading',
    SUCCESS: 'success'
  };

  // Animation configuration
  const MORPH_CONFIG = {
    hoverScale: 1.05,
    activeScale: 0.95,
    successDuration: 2000, // 2 seconds
    loadingMinDuration: 800 // Minimum loading state duration
  };

  // Check for prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Track button states
  const buttonStates = new WeakMap();

  /**
   * Initialize button morphing for all CTA buttons
   */
  function initButtonMorphing() {
    // Skip morphing effects if user prefers reduced motion
    if (prefersReducedMotion) {
      return;
    }

    // Select all CTA buttons
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary');

    ctaButtons.forEach(button => {
      // Initialize button state
      buttonStates.set(button, {
        currentState: BUTTON_STATES.DEFAULT,
        originalText: button.textContent.trim(),
        isProcessing: false
      });

      // Add morphing class
      button.classList.add('btn-morph');

      // Attach event listeners
      attachButtonListeners(button);
    });
  }

  /**
   * Attach event listeners to a button
   * @param {HTMLElement} button - The button element
   */
  function attachButtonListeners(button) {
    // Mouse events for hover state
    button.addEventListener('mouseenter', () => handleButtonHover(button, true));
    button.addEventListener('mouseleave', () => handleButtonHover(button, false));

    // Touch events for mobile
    button.addEventListener('touchstart', () => handleButtonActive(button, true), { passive: true });
    button.addEventListener('touchend', () => handleButtonActive(button, false), { passive: true });

    // Mouse down/up for active state
    button.addEventListener('mousedown', () => handleButtonActive(button, true));
    button.addEventListener('mouseup', () => handleButtonActive(button, false));

    // Click event for loading/success simulation (only for "Get Started" buttons)
    if (button.textContent.trim() === 'Get Started') {
      button.addEventListener('click', (e) => handleButtonClick(button, e));
    }
  }

  /**
   * Handle button hover state
   * @param {HTMLElement} button - The button element
   * @param {boolean} isHovering - Whether the button is being hovered
   */
  function handleButtonHover(button, isHovering) {
    const state = buttonStates.get(button);
    if (!state || state.isProcessing) return;

    if (isHovering) {
      button.setAttribute('data-morph-state', BUTTON_STATES.HOVER);
    } else {
      button.removeAttribute('data-morph-state');
    }
  }

  /**
   * Handle button active state
   * @param {HTMLElement} button - The button element
   * @param {boolean} isActive - Whether the button is active
   */
  function handleButtonActive(button, isActive) {
    const state = buttonStates.get(button);
    if (!state || state.isProcessing) return;

    if (isActive) {
      button.setAttribute('data-morph-state', BUTTON_STATES.ACTIVE);
    } else {
      button.removeAttribute('data-morph-state');
    }
  }

  /**
   * Handle button click for loading/success simulation
   * @param {HTMLElement} button - The button element
   * @param {Event} event - The click event
   */
  async function handleButtonClick(button, event) {
    const state = buttonStates.get(button);
    if (!state || state.isProcessing) return;

    // Don't prevent default for anchor links
    const href = button.getAttribute('href');
    if (href && href !== '#') {
      // Allow navigation but show quick loading state
      setButtonLoadingState(button, true);
      return;
    }

    // Prevent default for demo purposes
    event.preventDefault();

    // Start loading state
    state.isProcessing = true;
    await setButtonLoadingState(button, true);

    // Simulate async operation
    await simulateAsyncOperation();

    // Show success state
    await setButtonSuccessState(button);

    // Reset to default
    state.isProcessing = false;
    resetButtonState(button);
  }

  /**
   * Set button to loading state
   * @param {HTMLElement} button - The button element
   * @param {boolean} isLoading - Whether to set loading state
   */
  function setButtonLoadingState(button, isLoading) {
    return new Promise(resolve => {
      const state = buttonStates.get(button);
      if (!state) {
        resolve();
        return;
      }

      if (isLoading) {
        button.setAttribute('data-morph-state', BUTTON_STATES.LOADING);
        button.disabled = true;

        // Create loading spinner
        const spinner = document.createElement('span');
        spinner.className = 'btn-spinner';
        spinner.setAttribute('aria-hidden', 'true');
        spinner.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" opacity="0.25"></circle>
            <path d="M12 2a10 10 0 0 1 10 10" opacity="0.75">
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="rotate"
                from="0 12 12"
                to="360 12 12"
                dur="1s"
                repeatCount="indefinite"/>
            </path>
          </svg>
        `;

        // Store original content
        const originalContent = button.innerHTML;
        button.setAttribute('data-original-content', originalContent);

        // Replace with loading content
        button.innerHTML = '';
        button.appendChild(spinner);
        const loadingText = document.createElement('span');
        loadingText.textContent = 'Loading...';
        button.appendChild(loadingText);

        // Wait for minimum duration
        setTimeout(() => resolve(), MORPH_CONFIG.loadingMinDuration);
      } else {
        button.removeAttribute('data-morph-state');
        button.disabled = false;

        // Restore original content
        const originalContent = button.getAttribute('data-original-content');
        if (originalContent) {
          button.innerHTML = originalContent;
          button.removeAttribute('data-original-content');
        }

        resolve();
      }
    });
  }

  /**
   * Set button to success state
   * @param {HTMLElement} button - The button element
   */
  function setButtonSuccessState(button) {
    return new Promise(resolve => {
      button.setAttribute('data-morph-state', BUTTON_STATES.SUCCESS);

      // Create success checkmark
      const checkmark = document.createElement('span');
      checkmark.className = 'btn-checkmark';
      checkmark.setAttribute('aria-hidden', 'true');
      checkmark.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <polyline points="20 6 9 17 4 12" stroke-linecap="round" stroke-linejoin="round"></polyline>
        </svg>
      `;

      // Replace content with success message
      button.innerHTML = '';
      button.appendChild(checkmark);
      const successText = document.createElement('span');
      successText.textContent = 'Success!';
      button.appendChild(successText);

      // Announce success for screen readers
      const announcement = document.createElement('span');
      announcement.className = 'sr-only';
      announcement.setAttribute('role', 'status');
      announcement.setAttribute('aria-live', 'polite');
      announcement.textContent = 'Action completed successfully';
      button.appendChild(announcement);

      // Hold success state
      setTimeout(() => resolve(), MORPH_CONFIG.successDuration);
    });
  }

  /**
   * Reset button to default state
   * @param {HTMLElement} button - The button element
   */
  function resetButtonState(button) {
    const state = buttonStates.get(button);
    if (!state) return;

    button.removeAttribute('data-morph-state');
    button.disabled = false;

    // Restore original text
    button.textContent = state.originalText;
  }

  /**
   * Simulate async operation
   * @returns {Promise} - Resolves after a delay
   */
  function simulateAsyncOperation() {
    const delay = 1000 + Math.random() * 1000; // 1-2 seconds
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initButtonMorphing);
  } else {
    initButtonMorphing();
  }

})();

/**
 * Skeleton Loading States for Testimonial Images
 * Implements progressive image loading with skeleton placeholders
 */

(function() {
  'use strict';

  // Configuration
  const SKELETON_CONFIG = {
    fadeInDuration: 300,
    simulatedLoadDelay: 800 // Simulated delay for demo purposes
  };

  /**
   * Initialize skeleton loading for testimonial images
   */
  function initSkeletonLoading() {
    const testimonialCards = document.querySelectorAll('.testimonial-card');

    testimonialCards.forEach(card => {
      const image = card.querySelector('.testimonial-author img, .author-image img, img');
      if (image) {
        setupImageSkeleton(image);
      }
    });
  }

  /**
   * Setup skeleton loading for an image
   * @param {HTMLImageElement} image - The image element
   */
  function setupImageSkeleton(image) {
    // Skip if image is already loaded
    if (image.complete && image.naturalHeight !== 0) {
      return;
    }

    // Create skeleton wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'image-skeleton-wrapper';
    wrapper.setAttribute('aria-busy', 'true');
    wrapper.setAttribute('aria-label', 'Loading image');

    // Create skeleton element
    const skeleton = document.createElement('div');
    skeleton.className = 'image-skeleton';
    skeleton.setAttribute('aria-hidden', 'true');

    // Wrap image
    const parent = image.parentNode;
    parent.insertBefore(wrapper, image);
    wrapper.appendChild(skeleton);
    wrapper.appendChild(image);

    // Add loading class to image
    image.classList.add('image-loading');

    // Handle image load
    if (image.complete) {
      handleImageLoad(image, skeleton, wrapper);
    } else {
      image.addEventListener('load', () => handleImageLoad(image, skeleton, wrapper));
      image.addEventListener('error', () => handleImageError(image, skeleton, wrapper));

      // Simulate loading delay for demo (remove in production)
      if (image.src && !image.complete) {
        const originalSrc = image.src;
        image.src = '';
        setTimeout(() => {
          image.src = originalSrc;
        }, SKELETON_CONFIG.simulatedLoadDelay);
      }
    }
  }

  /**
   * Handle successful image load
   * @param {HTMLImageElement} image - The image element
   * @param {HTMLElement} skeleton - The skeleton element
   * @param {HTMLElement} wrapper - The wrapper element
   */
  function handleImageLoad(image, skeleton, wrapper) {
    // Remove loading class
    image.classList.remove('image-loading');
    image.classList.add('image-loaded');

    // Fade in image
    setTimeout(() => {
      skeleton.style.opacity = '0';

      setTimeout(() => {
        // Remove skeleton after fade out
        skeleton.remove();

        // Update wrapper attributes
        wrapper.removeAttribute('aria-busy');
        wrapper.removeAttribute('aria-label');

        // Unwrap if needed (optional, keeps structure simpler)
        if (wrapper.parentNode) {
          const parent = wrapper.parentNode;
          while (wrapper.firstChild) {
            parent.insertBefore(wrapper.firstChild, wrapper);
          }
          wrapper.remove();
        }
      }, SKELETON_CONFIG.fadeInDuration);
    }, 50);
  }

  /**
   * Handle image load error
   * @param {HTMLImageElement} image - The image element
   * @param {HTMLElement} skeleton - The skeleton element
   * @param {HTMLElement} wrapper - The wrapper element
   */
  function handleImageError(image, skeleton, wrapper) {
    // Remove loading class
    image.classList.remove('image-loading');
    image.classList.add('image-error');

    // Create error placeholder
    const errorPlaceholder = document.createElement('div');
    errorPlaceholder.className = 'image-error-placeholder';
    errorPlaceholder.setAttribute('role', 'img');
    errorPlaceholder.setAttribute('aria-label', 'Image failed to load');
    errorPlaceholder.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
    `;

    // Replace skeleton with error placeholder
    skeleton.replaceWith(errorPlaceholder);

    // Hide image
    image.style.display = 'none';

    // Update wrapper attributes
    wrapper.removeAttribute('aria-busy');
    wrapper.setAttribute('aria-label', 'Image failed to load');
  }

  /**
   * Observe new testimonial cards added dynamically
   */
  function observeNewTestimonials() {
    // Check for MutationObserver support
    if (!('MutationObserver' in window)) {
      return;
    }

    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            // Check if the added node is a testimonial card
            if (node.classList && node.classList.contains('testimonial-card')) {
              const image = node.querySelector('.testimonial-author img, .author-image img, img');
              if (image) {
                setupImageSkeleton(image);
              }
            }

            // Check if testimonial cards were added inside the node
            const testimonialCards = node.querySelectorAll('.testimonial-card');
            testimonialCards.forEach(card => {
              const image = card.querySelector('.testimonial-author img, .author-image img, img');
              if (image) {
                setupImageSkeleton(image);
              }
            });
          }
        });
      });
    });

    // Observe the testimonials section
    const testimonialsSection = document.querySelector('.testimonials');
    if (testimonialsSection) {
      observer.observe(testimonialsSection, {
        childList: true,
        subtree: true
      });
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initSkeletonLoading();
      observeNewTestimonials();
    });
  } else {
    initSkeletonLoading();
    observeNewTestimonials();
  }

})();
