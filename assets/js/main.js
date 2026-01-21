/**
 * Es Jardí - KENSINGTON Mallorca Southwest Central
 * Landing Page JavaScript
 * Version 2.0
 */

document.addEventListener('DOMContentLoaded', function() {

    // =====================================================
    // Splash Screen & Hero Animation
    // =====================================================
    const splashScreen = document.getElementById('splash-screen');
    const heroAnimateElements = document.querySelectorAll('.hero-animate');

    if (splashScreen) {
        // Add no-scroll to body while splash is visible
        document.body.classList.add('no-scroll');

        // Hide splash screen after animation completes
        setTimeout(function() {
            splashScreen.classList.add('hidden');
            document.body.classList.remove('no-scroll');

            // Trigger hero animations after splash screen fades
            heroAnimateElements.forEach(function(el) {
                el.classList.add('visible');
            });
        }, 3500); // 3.5 seconds total animation time
    } else {
        // If no splash screen, show hero elements immediately
        heroAnimateElements.forEach(function(el) {
            el.classList.add('visible');
        });
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
    // Inquiry System (mailto)
    // =====================================================
    const inquiryButtons = document.querySelectorAll('.btn-inquiry');
    const unitBadge = document.getElementById('unit-badge');
    const unitClear = document.getElementById('unit-clear');
    const unitHint = document.getElementById('inquiry-unit-hint');
    const interestOptions = document.querySelectorAll('input[name="interest"]');
    const sendInquiryBtn = document.getElementById('send-inquiry');

    // Store selected unit data
    let selectedUnit = null;
    let selectedInterest = null;

    // Handle unit selection from table
    inquiryButtons.forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            // Store unit data
            selectedUnit = {
                unit: this.dataset.unit,
                floor: this.dataset.floor,
                type: this.dataset.type,
                rooms: this.dataset.rooms,
                size: this.dataset.size
            };

            // Update UI
            updateUnitDisplay();
            updateSendButton();
        });
    });

    // Update unit display in contact section
    function updateUnitDisplay() {
        if (selectedUnit) {
            unitBadge.innerHTML = '<strong>WE ' + selectedUnit.unit + '</strong> | ' +
                selectedUnit.type + ' | ' +
                selectedUnit.rooms + ' Schlafzimmer | ' +
                selectedUnit.size;
            unitBadge.classList.add('unit-selected');
            unitBadge.classList.remove('unit-badge-link');
            unitBadge.removeAttribute('href');
            unitClear.style.display = 'inline-flex';
            unitHint.style.display = 'none';
        } else {
            unitBadge.innerHTML = '<i class="fas fa-hand-pointer"></i> Einheit auswählen';
            unitBadge.classList.remove('unit-selected');
            unitBadge.classList.add('unit-badge-link');
            unitBadge.setAttribute('href', '#einheiten');
            unitClear.style.display = 'none';
            unitHint.style.display = 'block';
        }
    }

    // Clear unit selection
    if (unitClear) {
        unitClear.addEventListener('click', function() {
            selectedUnit = null;
            updateUnitDisplay();
            updateSendButton();
        });
    }

    // Handle interest selection
    interestOptions.forEach(function(option) {
        option.addEventListener('change', function() {
            selectedInterest = this.value;
            updateSendButton();
        });
    });

    // Update send button state
    function updateSendButton() {
        if (sendInquiryBtn) {
            sendInquiryBtn.disabled = !selectedInterest;
        }
    }

    // Handle send inquiry button
    if (sendInquiryBtn) {
        sendInquiryBtn.addEventListener('click', function() {
            if (!selectedInterest) return;

            // Build email subject and body
            const email = 'katie.rejhon@kensington-international.com';
            let subject = '';
            let body = '';

            if (selectedUnit) {
                subject = 'Anfrage: ' + selectedInterest + ' - Es Jardí WE ' + selectedUnit.unit;
                body = 'Guten Tag,\n\n' +
                    'ich interessiere mich für folgende Wohneinheit im Projekt Es Jardí:\n\n' +
                    'Wohneinheit: ' + selectedUnit.unit + '\n' +
                    'Typ: ' + selectedUnit.type + '\n' +
                    'Etage: ' + selectedUnit.floor + '\n' +
                    'Schlafzimmer: ' + selectedUnit.rooms + '\n' +
                    'Größe: ' + selectedUnit.size + '\n\n' +
                    'Mein Anliegen: ' + selectedInterest + '\n\n' +
                    'Bitte kontaktieren Sie mich für weitere Informationen.\n\n' +
                    'Mit freundlichen Grüßen';
            } else {
                subject = 'Anfrage: ' + selectedInterest + ' - Es Jardí Palma';
                body = 'Guten Tag,\n\n' +
                    'ich interessiere mich für das Projekt Es Jardí in Palma.\n\n' +
                    'Mein Anliegen: ' + selectedInterest + '\n\n' +
                    'Bitte kontaktieren Sie mich für weitere Informationen.\n\n' +
                    'Mit freundlichen Grüßen';
            }

            // Create mailto link
            const mailtoLink = 'mailto:' + email +
                '?subject=' + encodeURIComponent(subject) +
                '&body=' + encodeURIComponent(body);

            // Open email client
            window.location.href = mailtoLink;
        });
    }

    // =====================================================
    // Gallery Lightbox Carousel
    // =====================================================
    const galleryItems = document.querySelectorAll('.gallery-item');
    const galleryImages = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return img ? { src: img.src, alt: img.alt } : null;
    }).filter(Boolean);

    let currentImageIndex = 0;
    let lightboxElement = null;

    function openLightbox(index) {
        currentImageIndex = index;

        // Create lightbox
        lightboxElement = document.createElement('div');
        lightboxElement.className = 'lightbox';
        lightboxElement.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-prev"><i class="fas fa-chevron-left"></i></button>
                <img src="${galleryImages[currentImageIndex].src}" alt="${galleryImages[currentImageIndex].alt}">
                <button class="lightbox-next"><i class="fas fa-chevron-right"></i></button>
                <button class="lightbox-close">&times;</button>
                <div class="lightbox-counter">${currentImageIndex + 1} / ${galleryImages.length}</div>
            </div>
        `;

        // Add styles
        lightboxElement.style.cssText = `
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
        `;

        const lightboxContent = lightboxElement.querySelector('.lightbox-content');
        lightboxContent.style.cssText = `
            position: relative;
            max-width: 90%;
            max-height: 90%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const lightboxImg = lightboxElement.querySelector('img');
        lightboxImg.style.cssText = `
            max-width: 100%;
            max-height: 85vh;
            object-fit: contain;
        `;

        const closeBtn = lightboxElement.querySelector('.lightbox-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: -50px;
            right: 0;
            background: none;
            border: none;
            color: white;
            font-size: 2rem;
            cursor: pointer;
            padding: 0.5rem;
        `;

        const prevBtn = lightboxElement.querySelector('.lightbox-prev');
        const nextBtn = lightboxElement.querySelector('.lightbox-next');
        const navBtnStyles = `
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            background: rgba(255, 255, 255, 0.1);
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 1rem;
            border-radius: 50%;
            transition: background 0.3s ease;
        `;
        prevBtn.style.cssText = navBtnStyles + 'left: -80px;';
        nextBtn.style.cssText = navBtnStyles + 'right: -80px;';

        const counter = lightboxElement.querySelector('.lightbox-counter');
        counter.style.cssText = `
            position: absolute;
            bottom: -40px;
            left: 50%;
            transform: translateX(-50%);
            color: white;
            font-size: 0.9rem;
            font-family: 'Montserrat', sans-serif;
        `;

        document.body.appendChild(lightboxElement);
        document.body.classList.add('no-scroll');

        // Event listeners
        closeBtn.addEventListener('click', closeLightbox);
        prevBtn.addEventListener('click', function(e) { e.stopPropagation(); showPrevImage(); });
        nextBtn.addEventListener('click', function(e) { e.stopPropagation(); showNextImage(); });
        lightboxElement.addEventListener('click', function(e) {
            if (e.target === lightboxElement) closeLightbox();
        });

        // Keyboard navigation
        document.addEventListener('keydown', handleKeydown);
    }

    function updateLightboxImage() {
        if (!lightboxElement) return;
        const img = lightboxElement.querySelector('img');
        const counter = lightboxElement.querySelector('.lightbox-counter');
        img.src = galleryImages[currentImageIndex].src;
        img.alt = galleryImages[currentImageIndex].alt;
        counter.textContent = `${currentImageIndex + 1} / ${galleryImages.length}`;
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
        updateLightboxImage();
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
        updateLightboxImage();
    }

    function closeLightbox() {
        if (lightboxElement) {
            lightboxElement.remove();
            lightboxElement = null;
            document.body.classList.remove('no-scroll');
            document.removeEventListener('keydown', handleKeydown);
        }
    }

    function handleKeydown(e) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') showPrevImage();
        if (e.key === 'ArrowRight') showNextImage();
    }

    galleryItems.forEach(function(item, index) {
        item.style.cursor = 'pointer';
        item.addEventListener('click', function() {
            openLightbox(index);
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
