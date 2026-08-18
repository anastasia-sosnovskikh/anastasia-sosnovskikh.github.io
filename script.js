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

    const systemMap = document.querySelector('.system-map');
    const systemNodes = Array.from(document.querySelectorAll('[data-system-step]'));
    const systemDetail = document.getElementById('system-detail');

    if (systemMap && systemDetail && systemNodes.length) {
        const systemCore = systemMap.querySelector('.system-core');
        const systemSpokes = Array.from(systemMap.querySelectorAll('[data-system-spoke]'));
        const detailPhase = systemDetail.querySelector('[data-system-phase]');
        const detailNumber = systemDetail.querySelector('[data-system-number]');
        const detailTitle = systemDetail.querySelector('[data-system-title]');
        const detailDescription = systemDetail.querySelector('[data-system-description]');
        let corePulseAnimation = null;
        let detailRevealAnimation = null;

        function activateSystemNode(node) {
            const phase = node.dataset.phase.toLowerCase();
            const wasActive = node.classList.contains('is-active');

            systemNodes.forEach(item => {
                const isActive = item === node;
                item.classList.toggle('is-active', isActive);
                item.setAttribute('aria-pressed', String(isActive));
            });

            systemSpokes.forEach(spoke => {
                spoke.classList.toggle('is-active', spoke.dataset.systemSpoke === node.dataset.step);
            });

            detailPhase.textContent = node.dataset.phase;
            detailNumber.textContent = node.dataset.step;
            detailTitle.textContent = node.dataset.title;
            detailDescription.textContent = node.dataset.description;
            systemDetail.dataset.phase = phase;
            systemMap.dataset.activePhase = phase;

            if (!wasActive && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                if (systemCore && typeof systemCore.animate === 'function') {
                    if (corePulseAnimation) corePulseAnimation.cancel();
                    corePulseAnimation = systemCore.animate([
                        { transform: 'translate(-50%, -50%) scale(1)' },
                        { transform: 'translate(-50%, -50%) scale(1.035)', offset: 0.45 },
                        { transform: 'translate(-50%, -50%) scale(1)' }
                    ], {
                        duration: 460,
                        easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)'
                    });
                }

                if (typeof systemDetail.animate === 'function') {
                    if (detailRevealAnimation) detailRevealAnimation.cancel();
                    detailRevealAnimation = systemDetail.animate([
                        { opacity: 0.68, transform: 'translateY(3px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ], {
                        duration: 240,
                        easing: 'ease-out'
                    });
                }
            }
        }

        systemNodes.forEach((node, index) => {
            node.addEventListener('pointerenter', () => activateSystemNode(node));
            node.addEventListener('focus', () => activateSystemNode(node));
            node.addEventListener('click', () => activateSystemNode(node));
            node.addEventListener('keydown', event => {
                let nextIndex = null;

                if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                    nextIndex = (index + 1) % systemNodes.length;
                } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                    nextIndex = (index - 1 + systemNodes.length) % systemNodes.length;
                } else if (event.key === 'Home') {
                    nextIndex = 0;
                } else if (event.key === 'End') {
                    nextIndex = systemNodes.length - 1;
                }

                if (nextIndex !== null) {
                    event.preventDefault();
                    systemNodes[nextIndex].focus();
                }
            });
        });

        if ('IntersectionObserver' in window) {
            const systemObserver = new IntersectionObserver(entries => {
                if (entries.some(entry => entry.isIntersecting)) {
                    systemMap.classList.add('is-visible');
                    systemObserver.disconnect();
                }
            }, { threshold: 0.25 });

            systemObserver.observe(systemMap);
        } else {
            systemMap.classList.add('is-visible');
        }
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
