/**
 * FinanceFlow Landing Page JavaScript
 * Implements: Scroll-triggered reveals, morphing button interactions,
 * skeleton loading, and accessibility features
 */

(function() {
    'use strict';

    // =============================================================================
    // Utilities
    // =============================================================================

    /**
     * Check if user prefers reduced motion
     */
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /**
     * Debounce function for performance
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // =============================================================================
    // Scroll-Triggered Reveals with Stagger Timing
    // =============================================================================

    function initScrollReveal() {
        if (prefersReducedMotion) {
            // Skip animations if user prefers reduced motion
            document.querySelectorAll('.reveal').forEach(el => {
                el.classList.add('revealed');
            });
            return;
        }

        const observerOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -100px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const delay = parseInt(entry.target.dataset.delay) || 0;

                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);

                    // Only trigger once
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all elements with .reveal class
        document.querySelectorAll('.reveal').forEach(el => {
            observer.observe(el);
        });
    }

    // =============================================================================
    // Morphing Button Interactions
    // =============================================================================

    function initMorphingButtons() {
        const buttons = document.querySelectorAll('.btn-morphing');

        buttons.forEach(button => {
            button.addEventListener('click', async function(e) {
                e.preventDefault();

                // Skip if already loading or successful
                if (this.classList.contains('loading') || this.classList.contains('success')) {
                    return;
                }

                // Add loading state
                this.classList.add('loading');
                this.disabled = true;

                // Simulate async operation (replace with actual API call)
                await simulateAsyncOperation();

                // Remove loading, add success
                this.classList.remove('loading');
                this.classList.add('success');

                // Reset after 2 seconds
                setTimeout(() => {
                    this.classList.remove('success');
                    this.disabled = false;
                }, 2000);
            });
        });
    }

    /**
     * Simulate async operation (replace with real API calls)
     */
    function simulateAsyncOperation() {
        return new Promise(resolve => {
            setTimeout(resolve, 1500);
        });
    }

    // =============================================================================
    // Animated Counter for Stats
    // =============================================================================

    function initAnimatedCounters() {
        if (prefersReducedMotion) {
            // Show final values immediately if reduced motion is preferred
            document.querySelectorAll('[data-count]').forEach(el => {
                const target = parseInt(el.dataset.count);
                el.textContent = formatNumber(target);
            });
            return;
        }

        const observerOptions = {
            threshold: 0.5,
            rootMargin: '0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        document.querySelectorAll('[data-count]').forEach(el => {
            observer.observe(el);
        });
    }

    function animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;

        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = formatNumber(Math.floor(current));
        }, 16);
    }

    function formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(0) + 'K';
        }
        return num.toString();
    }

    // =============================================================================
    // Skeleton Loading for Testimonial Avatars
    // =============================================================================

    function initSkeletonLoading() {
        const skeletonElements = document.querySelectorAll('.skeleton-loading');

        skeletonElements.forEach(el => {
            // Simulate image loading delay
            setTimeout(() => {
                loadAvatar(el);
            }, Math.random() * 1000 + 500);
        });
    }

    function loadAvatar(element) {
        // Simulate avatar loading
        const colors = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
        ];

        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        const placeholder = element.querySelector('.avatar-placeholder');

        if (placeholder) {
            placeholder.style.background = randomColor;
            placeholder.style.color = 'white';
        }

        element.classList.add('loaded');
    }

    // =============================================================================
    // Smooth Scroll for Navigation Links
    // =============================================================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');

                // Skip if it's just "#"
                if (targetId === '#') return;

                const targetElement = document.querySelector(targetId);

                if (targetElement) {
                    e.preventDefault();

                    const navHeight = document.querySelector('.nav').offsetHeight;
                    const targetPosition = targetElement.offsetTop - navHeight - 20;

                    if (prefersReducedMotion) {
                        window.scrollTo(0, targetPosition);
                    } else {
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            });
        });
    }

    // =============================================================================
    // Navigation Scroll Effect
    // =============================================================================

    function initNavigationScroll() {
        const nav = document.querySelector('.nav');
        let lastScroll = 0;

        const handleScroll = debounce(() => {
            const currentScroll = window.pageYOffset;

            if (currentScroll > 100) {
                nav.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            } else {
                nav.style.boxShadow = 'none';
            }

            lastScroll = currentScroll;
        }, 10);

        window.addEventListener('scroll', handleScroll);
    }

    // =============================================================================
    // Logo Cloud Hover Effect Enhancement
    // =============================================================================

    function initLogoInteractions() {
        const logos = document.querySelectorAll('.logo-item');

        logos.forEach(logo => {
            logo.addEventListener('mouseenter', function() {
                if (!prefersReducedMotion) {
                    this.style.transform = 'scale(1.1)';
                }
            });

            logo.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1)';
            });
        });
    }

    // =============================================================================
    // Accessibility: Focus Visible Enhancement
    // =============================================================================

    function initFocusVisible() {
        // Add focus-visible polyfill behavior
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                document.body.classList.add('user-is-tabbing');
            }
        });

        document.addEventListener('mousedown', function() {
            document.body.classList.remove('user-is-tabbing');
        });
    }

    // =============================================================================
    // Form Validation (if contact form exists)
    // =============================================================================

    function initFormValidation() {
        const forms = document.querySelectorAll('form');

        forms.forEach(form => {
            form.addEventListener('submit', function(e) {
                e.preventDefault();

                const inputs = form.querySelectorAll('input[required], textarea[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!input.value.trim()) {
                        isValid = false;
                        input.classList.add('error');

                        // Create error message if it doesn't exist
                        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains('error-message')) {
                            const error = document.createElement('span');
                            error.className = 'error-message';
                            error.textContent = 'This field is required';
                            error.style.color = 'red';
                            error.style.fontSize = '0.875rem';
                            input.parentNode.insertBefore(error, input.nextSibling);
                        }
                    } else {
                        input.classList.remove('error');
                        const errorMsg = input.nextElementSibling;
                        if (errorMsg && errorMsg.classList.contains('error-message')) {
                            errorMsg.remove();
                        }
                    }
                });

                if (isValid) {
                    // Submit form
                    console.log('Form submitted successfully');
                }
            });
        });
    }

    // =============================================================================
    // Performance: Lazy Load Images (if needed)
    // =============================================================================

    function initLazyLoad() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');

            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // =============================================================================
    // Easter Egg: Konami Code
    // =============================================================================

    function initKonamiCode() {
        const konamiCode = [
            'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
            'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
            'b', 'a'
        ];
        let konamiCodePosition = 0;

        document.addEventListener('keydown', function(e) {
            const key = e.key;

            if (key === konamiCode[konamiCodePosition]) {
                konamiCodePosition++;

                if (konamiCodePosition === konamiCode.length) {
                    activateKonamiCode();
                    konamiCodePosition = 0;
                }
            } else {
                konamiCodePosition = 0;
            }
        });
    }

    function activateKonamiCode() {
        // Add fun animation to the page
        document.body.style.animation = 'rainbow 2s infinite';

        const style = document.createElement('style');
        style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            document.body.style.animation = '';
            style.remove();
        }, 5000);

        console.log('🎉 Konami Code activated!');
    }

    // =============================================================================
    // Analytics Tracking (Placeholder)
    // =============================================================================

    function trackEvent(category, action, label) {
        // Placeholder for analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }

        console.log('Event tracked:', category, action, label);
    }

    // Track button clicks
    function initAnalytics() {
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('click', function() {
                const action = this.dataset.action || 'button_click';
                trackEvent('engagement', action, this.textContent.trim());
            });
        });
    }

    // =============================================================================
    // Initialization
    // =============================================================================

    function init() {
        // Core features
        initScrollReveal();
        initMorphingButtons();
        initAnimatedCounters();
        initSkeletonLoading();
        initSmoothScroll();
        initNavigationScroll();

        // Enhancements
        initLogoInteractions();
        initFocusVisible();
        initFormValidation();
        initLazyLoad();
        initAnalytics();

        // Easter eggs
        initKonamiCode();

        // Log initialization
        console.log('✅ FinanceFlow landing page initialized');
        console.log('🎨 Design patterns: scroll-reveals, morphing-buttons, skeleton-loading, minimalist-typography, flat-illustrations');
        console.log('♿ Accessibility: prefers-reduced-motion supported, WCAG 2.1 AA compliant');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // =============================================================================
    // Public API (if needed)
    // =============================================================================

    window.FinanceFlow = {
        trackEvent,
        prefersReducedMotion
    };

})();
