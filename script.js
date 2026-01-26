// ========================================
// Scroll Spy + Theme Toggle
// ========================================

(function() {
    'use strict';

    // Theme Toggle
    const themeToggle = document.querySelector('.theme-toggle');
    const body = document.body;

    // Check for saved theme preference or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    body.classList.remove('theme-light', 'theme-dark');
    body.classList.add(`theme-${savedTheme}`);

    themeToggle.addEventListener('click', () => {
        const isDark = body.classList.contains('theme-dark');
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(isDark ? 'theme-light' : 'theme-dark');
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    });

    // Scroll Spy
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    function updateActiveLink() {
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                navLinks[index].classList.add('active');
            }
        });

        // Handle bottom of page (last section)
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            navLinks.forEach(link => link.classList.remove('active'));
            navLinks[navLinks.length - 1].classList.add('active');
        }
    }

    // Throttle scroll events
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                updateActiveLink();
                ticking = false;
            });
            ticking = true;
        }
    });

    // Smooth scroll for nav links with easing
    function smoothScrollTo(target, duration = 800) {
        const start = window.scrollY;
        const offset = window.innerWidth > 900 ? 0 : 80;
        const targetPosition = target.offsetTop - offset;
        const distance = targetPosition - start;
        let startTime = null;

        function easeOutCubic(t) {
            return 1 - Math.pow(1 - t, 3);
        }

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = easeOutCubic(progress);

            window.scrollTo(0, start + distance * eased);

            if (progress < 1) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                smoothScrollTo(targetSection);
            }
        });
    });

    // Initial call
    updateActiveLink();

    // Contact Form Submission
    const form = document.getElementById('contact-form');
    const status = form.querySelector('.form-status');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);

        try {
            const response = await fetch('https://formspree.io/f/xwvoqyjz', {
                method: 'POST',
                body: data,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                status.textContent = 'Message sent!';
                form.reset();
            } else {
                status.textContent = 'Something went wrong. Try again.';
            }
        } catch (error) {
            status.textContent = 'Something went wrong. Try again.';
        }
    });
})();
