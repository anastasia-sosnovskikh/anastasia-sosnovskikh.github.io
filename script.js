// ========================================
// Scroll Spy + Theme Toggle
// ========================================

(function() {
    'use strict';

    const body = document.body;
    const themeToggle = document.querySelector('.theme-toggle');
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    function getStoredTheme() {
        try {
            return localStorage.getItem('theme') || 'light';
        } catch (error) {
            return 'light';
        }
    }

    function storeTheme(theme) {
        try {
            localStorage.setItem('theme', theme);
        } catch (error) {
            // Theme persistence is optional; keep the toggle usable without it.
        }
    }

    function applyTheme(theme) {
        const nextTheme = theme === 'dark' ? 'dark' : 'light';
        body.classList.remove('theme-light', 'theme-dark');
        body.classList.add(`theme-${nextTheme}`);

        if (themeToggle) {
            themeToggle.setAttribute('aria-pressed', String(nextTheme === 'dark'));
            themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
        }
    }

    applyTheme(getStoredTheme());

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const isDark = body.classList.contains('theme-dark');
            const nextTheme = isDark ? 'light' : 'dark';
            applyTheme(nextTheme);
            storeTheme(nextTheme);
        });
    }

    function setActiveLink(activeLink) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'true');
        }
    }

    function updateActiveLink() {
        let activeLink = null;
        const scrollPosition = window.scrollY + window.innerHeight / 3;

        sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                activeLink = navLinks[index];
            }
        });

        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 10) {
            activeLink = navLinks[navLinks.length - 1];
        }

        setActiveLink(activeLink);
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

    function smoothScrollTo(target, duration = 800) {
        const start = window.scrollY;
        const offset = window.innerWidth > 900 ? 96 : 80;
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

            if (!targetSection) return;

            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const offset = window.innerWidth > 900 ? 96 : 80;
                window.scrollTo(0, targetSection.offsetTop - offset);
                return;
            }

            smoothScrollTo(targetSection);
        });
    });

    updateActiveLink();

    // Easter egg: triple-click logo to reveal playlist
    const logo = document.querySelector('.logo');
    let clickCount = 0;
    let clickTimer = null;

    if (logo) {
        logo.addEventListener('click', (e) => {
            clickCount++;
            clearTimeout(clickTimer);
            if (clickCount === 3) {
                e.preventDefault();
                clickCount = 0;
                const existing = document.querySelector('.easter-egg');
                if (existing) { existing.remove(); return; }
                const el = document.createElement('a');
                el.className = 'easter-egg';
                el.href = 'https://www.youtube.com/watch?v=d2XcKa8iagg';
                el.target = '_blank';
                el.rel = 'noopener';
                el.innerHTML = '&#9834; &#9835;';
                logo.parentElement.insertBefore(el, logo.nextSibling);
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, 400);
            }
        });
    }

    const form = document.getElementById('contact-form');

    if (form) {
        const status = form.querySelector('.form-status');
        const submitButton = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const data = new FormData(form);

            if (status) status.textContent = 'Sending...';
            if (submitButton) submitButton.disabled = true;

            try {
                const response = await fetch('https://formspree.io/f/xwvoqyjz', {
                    method: 'POST',
                    body: data,
                    headers: { 'Accept': 'application/json' }
                });

                if (status) {
                    status.textContent = response.ok ? 'Message sent!' : 'Something went wrong. Try again.';
                }

                if (response.ok) form.reset();
            } catch (error) {
                if (status) status.textContent = 'Something went wrong. Try again.';
            } finally {
                if (submitButton) submitButton.disabled = false;
            }
        });
    }
})();
