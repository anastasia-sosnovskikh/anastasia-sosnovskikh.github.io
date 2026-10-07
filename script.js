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

    updateActiveLink();

    const sectionLinks = document.querySelectorAll(
        '.nav-link, .button-link[href^="#"], .logo, .social-links a[href^="#"]'
    );
    let sectionScrollFrame = null;

    sectionLinks.forEach(link => {
        link.addEventListener('click', event => {
            if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            const target = document.querySelector(link.getAttribute('href'));
            if (!target) return;

            event.preventDefault();

            if (sectionScrollFrame) cancelAnimationFrame(sectionScrollFrame);

            const start = window.scrollY;
            const offset = window.innerWidth > 900 ? 96 : 88;
            const destination = Math.max(0, target.getBoundingClientRect().top + start - offset);
            const distance = destination - start;
            const duration = Math.min(850, Math.max(480, Math.abs(distance) * 0.18));
            const startTime = performance.now();

            function step(now) {
                const progress = Math.min((now - startTime) / duration, 1);
                const eased = progress < 0.5
                    ? 4 * Math.pow(progress, 3)
                    : 1 - Math.pow(-2 * progress + 2, 3) / 2;
                window.scrollTo(0, start + distance * eased);

                if (progress < 1) {
                    sectionScrollFrame = requestAnimationFrame(step);
                } else {
                    sectionScrollFrame = null;
                    history.replaceState(null, '', link.getAttribute('href'));
                }
            }

            sectionScrollFrame = requestAnimationFrame(step);
        });
    });

    const traceDiagram = document.querySelector('.trace-diagram');
    const tracePhases = Array.from(document.querySelectorAll('[data-trace-phase]'));
    const traceDetail = document.getElementById('trace-detail');

    if (traceDiagram && traceDetail && tracePhases.length) {
        const traceContent = {
            frame: {
                label: 'Frame',
                range: '01–02',
                titleOne: 'Frame the problem',
                descriptionOne: 'Clarify the need, users, constraints, and technical context.',
                titleTwo: 'Define success',
                descriptionTwo: 'Set KPIs and technical guardrails before implementation.'
            },
            architect: {
                label: 'Architect',
                range: '03–04',
                titleOne: 'Set technical direction',
                descriptionOne: 'Evaluate product, data, ML, and infrastructure tradeoffs.',
                titleTwo: 'Shape the solution',
                descriptionTwo: 'Turn direction into system boundaries and an executable plan.'
            },
            deliver: {
                label: 'Deliver',
                range: '05–06',
                titleOne: 'Lead execution',
                descriptionOne: 'Align frontend, backend, design, data science, ML, and infrastructure.',
                titleTwo: 'Remove blockers',
                descriptionTwo: 'Resolve technical dependencies and mobilize partner teams.'
            },
            improve: {
                label: 'Improve',
                range: '07–08',
                titleOne: 'Deliver and operate',
                descriptionOne: 'Lead production readiness, reliability, security, and adoption.',
                titleTwo: 'Measure and improve',
                descriptionTwo: 'Track system performance and business impact, then iterate.'
            }
        };
        const phaseLabel = traceDetail.querySelector('[data-trace-phase-label]');
        const phaseRange = traceDetail.querySelector('[data-trace-range]');
        const titleOne = traceDetail.querySelector('[data-trace-title-one]');
        const descriptionOne = traceDetail.querySelector('[data-trace-description-one]');
        const titleTwo = traceDetail.querySelector('[data-trace-title-two]');
        const descriptionTwo = traceDetail.querySelector('[data-trace-description-two]');
        let detailAnimation = null;

        function activateTracePhase(button) {
            const phase = button.dataset.tracePhase;
            const content = traceContent[phase];
            const wasActive = button.classList.contains('is-active');

            tracePhases.forEach(item => {
                const isActive = item === button;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
            });

            traceDiagram.dataset.activePhase = phase;
            traceDetail.dataset.phase = phase;
            phaseLabel.textContent = content.label;
            phaseRange.textContent = content.range;
            titleOne.textContent = content.titleOne;
            descriptionOne.textContent = content.descriptionOne;
            titleTwo.textContent = content.titleTwo;
            descriptionTwo.textContent = content.descriptionTwo;

            if (!wasActive && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && typeof traceDetail.animate === 'function') {
                if (detailAnimation) detailAnimation.cancel();
                detailAnimation = traceDetail.animate([
                    { opacity: 0.7, transform: 'translateY(3px)' },
                    { opacity: 1, transform: 'translateY(0)' }
                ], {
                    duration: 220,
                    easing: 'ease-out'
                });
            }
        }

        tracePhases.forEach((button, index) => {
            button.addEventListener('pointerenter', () => activateTracePhase(button));
            button.addEventListener('focus', () => activateTracePhase(button));
            button.addEventListener('click', () => activateTracePhase(button));
            button.addEventListener('keydown', event => {
                let nextIndex = null;

                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    nextIndex = (index + 1) % tracePhases.length;
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    nextIndex = (index - 1 + tracePhases.length) % tracePhases.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = tracePhases.length - 1;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    tracePhases[nextIndex].focus();
                }
            });
        });
    }

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
