/**
 * La Geoda - KENSINGTON Finest Properties
 * Landing Page JavaScript
 * Version 1.0
 */

document.addEventListener('DOMContentLoaded', function() {

    // =====================================================
    // Splash Screen
    // =====================================================
    const splashScreen = document.getElementById('splash-screen');

    if (splashScreen) {
        // Add no-scroll to body while splash is visible
        document.body.classList.add('no-scroll');

        // Hide splash screen after animation completes
        setTimeout(function() {
            splashScreen.classList.add('hidden');
            document.body.classList.remove('no-scroll');
        }, 3500); // 3.5 seconds total animation time
    }

    // =====================================================
    // Header Scroll Effect
    // =====================================================
    const header = document.getElementById('header');
    let lastScrollY = window.scrollY;

    function updateHeader() {
        const currentScrollY = window.scrollY;

        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        lastScrollY = currentScrollY;
    }

    window.addEventListener('scroll', updateHeader);
    updateHeader(); // Initial check

    // =====================================================
    // Mobile Navigation
    // =====================================================
    const menuToggle = document.getElementById('menu-toggle');
    const navMobile = document.getElementById('nav-mobile');
    const navLinks = document.querySelectorAll('.nav-mobile .nav-link');

    if (menuToggle && navMobile) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navMobile.classList.toggle('active');
            document.body.classList.toggle('no-scroll');
        });

        // Close menu when clicking on a link
        navLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                navMobile.classList.remove('active');
                document.body.classList.remove('no-scroll');
            });
        });
    }

    // =====================================================
    // Smooth Scroll for Navigation Links
    // =====================================================
    const allNavLinks = document.querySelectorAll('a[href^="#"]');

    allNavLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href !== '#') {
                const target = document.querySelector(href);

                if (target) {
                    e.preventDefault();

                    const headerHeight = header.offsetHeight;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // =====================================================
    // Fade In Animation on Scroll
    // =====================================================
    const fadeElements = document.querySelectorAll('.section-header, .highlight-card, .feature-item, .gallery-item');

    const fadeObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in', 'visible');
                fadeObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    fadeElements.forEach(function(el) {
        el.classList.add('fade-in');
        fadeObserver.observe(el);
    });

    // =====================================================
    // Contact Form Handling
    // =====================================================
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = new FormData(this);
            const data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });

            // Here you would typically send the data to a server
            // For now, we'll just show a success message
            console.log('Form submitted:', data);

            // Show success message
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.textContent;
            btn.textContent = 'Anfrage gesendet!';
            btn.disabled = true;
            btn.style.backgroundColor = '#2a7a68';

            // Reset after 3 seconds
            setTimeout(function() {
                btn.textContent = originalText;
                btn.disabled = false;
                btn.style.backgroundColor = '';
                contactForm.reset();
            }, 3000);
        });
    }

    // =====================================================
    // Gallery Lightbox (Simple Implementation)
    // =====================================================
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(function(item) {
        item.style.cursor = 'pointer';

        item.addEventListener('click', function() {
            const img = this.querySelector('img');
            if (img) {
                // Create lightbox
                const lightbox = document.createElement('div');
                lightbox.className = 'lightbox';
                lightbox.innerHTML = `
                    <div class="lightbox-content">
                        <img src="${img.src}" alt="${img.alt}">
                        <button class="lightbox-close">&times;</button>
                    </div>
                `;

                // Add styles
                lightbox.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    cursor: pointer;
                `;

                const lightboxContent = lightbox.querySelector('.lightbox-content');
                lightboxContent.style.cssText = `
                    position: relative;
                    max-width: 90%;
                    max-height: 90%;
                `;

                const lightboxImg = lightbox.querySelector('img');
                lightboxImg.style.cssText = `
                    max-width: 100%;
                    max-height: 90vh;
                    object-fit: contain;
                `;

                const closeBtn = lightbox.querySelector('.lightbox-close');
                closeBtn.style.cssText = `
                    position: absolute;
                    top: -40px;
                    right: 0;
                    background: none;
                    border: none;
                    color: white;
                    font-size: 2rem;
                    cursor: pointer;
                    padding: 0.5rem;
                `;

                document.body.appendChild(lightbox);
                document.body.classList.add('no-scroll');

                // Close lightbox
                function closeLightbox() {
                    lightbox.remove();
                    document.body.classList.remove('no-scroll');
                }

                lightbox.addEventListener('click', closeLightbox);
                closeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    closeLightbox();
                });

                // Close on escape key
                document.addEventListener('keydown', function escHandler(e) {
                    if (e.key === 'Escape') {
                        closeLightbox();
                        document.removeEventListener('keydown', escHandler);
                    }
                });
            }
        });
    });

    // =====================================================
    // Parallax Effect for Hero (Subtle)
    // =====================================================
    const heroMedia = document.querySelector('.hero-media img');

    if (heroMedia) {
        window.addEventListener('scroll', function() {
            const scrollY = window.scrollY;
            const heroHeight = document.querySelector('.hero').offsetHeight;

            if (scrollY < heroHeight) {
                heroMedia.style.transform = `translateY(${scrollY * 0.3}px)`;
            }
        });
    }

    // =====================================================
    // Typing Effect for Hero Title (Optional)
    // =====================================================
    // Uncomment to enable typing effect
    /*
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.visibility = 'visible';

        let i = 0;
        function typeWriter() {
            if (i < text.length) {
                heroTitle.textContent += text.charAt(i);
                i++;
                setTimeout(typeWriter, 50);
            }
        }

        // Start after splash screen
        setTimeout(typeWriter, 3500);
    }
    */

    // =====================================================
    // Active Navigation Link on Scroll
    // =====================================================
    const sections = document.querySelectorAll('section[id]');

    function updateActiveLink() {
        const scrollY = window.scrollY;

        sections.forEach(function(section) {
            const sectionTop = section.offsetTop - 150;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                document.querySelectorAll('.nav-link').forEach(function(link) {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + sectionId) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveLink);

    // =====================================================
    // Units Accordion
    // =====================================================
    const unitsToggle = document.getElementById('units-toggle');
    const unitsHidden = document.getElementById('units-hidden');

    if (unitsToggle && unitsHidden) {
        unitsToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            unitsHidden.classList.toggle('open');
        });
    }

    // =====================================================
    // Counter Animation for Stats
    // =====================================================
    const stats = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    function animateStats() {
        if (statsAnimated) return;

        const heroStats = document.querySelector('.hero-stats');
        if (!heroStats) return;

        const rect = heroStats.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;

        if (isVisible) {
            statsAnimated = true;

            stats.forEach(function(stat) {
                const text = stat.textContent;
                const hasRange = text.includes('-');

                if (hasRange) {
                    // Don't animate range values
                    return;
                }

                const value = parseInt(text);
                if (!isNaN(value)) {
                    let current = 0;
                    const increment = value / 50;
                    const duration = 1500;
                    const stepTime = duration / 50;

                    const counter = setInterval(function() {
                        current += increment;
                        if (current >= value) {
                            stat.textContent = value;
                            clearInterval(counter);
                        } else {
                            stat.textContent = Math.floor(current);
                        }
                    }, stepTime);
                }
            });
        }
    }

    window.addEventListener('scroll', animateStats);
    setTimeout(animateStats, 3600); // Check after splash screen

});
