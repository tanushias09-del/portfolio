(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.loader');
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const menuButton = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.mobile-menu');
  const dot = document.querySelector('.cursor-dot');
  const ring = document.querySelector('.cursor-ring');

  const finishLoading = () => window.setTimeout(() => loader?.classList.add('done'), reducedMotion ? 0 : 850);
  if (document.readyState === 'complete') finishLoading(); else window.addEventListener('load', finishLoading, { once: true });

  document.querySelectorAll('[data-delay]').forEach((el) => el.style.setProperty('--delay', `${el.dataset.delay}ms`));

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.13, rootMargin: '0px 0px -7% 0px' });
  document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || reducedMotion) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      let value = 0;
      const timer = setInterval(() => {
        value += 1;
        el.textContent = String(Math.min(value, target)).padStart(2, '0');
        if (value >= target) clearInterval(timer);
      }, 180);
      countObserver.unobserve(el);
    });
  }, { threshold: .8 });
  document.querySelectorAll('[data-count]').forEach((el) => countObserver.observe(el));

  const updateScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max > 0 ? (y / max) * 100 : 0}%`;
    header?.classList.toggle('scrolled', y > 30);
    if (!reducedMotion) {
      document.querySelectorAll('[data-parallax]').forEach((el) => {
        const speed = Number(el.dataset.parallax || 0);
        el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
      });
    }
  };
  updateScroll();
  window.addEventListener('scroll', updateScroll, { passive: true });

  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  sections.forEach((section) => navObserver.observe(section));

  const closeMenu = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-hidden', 'true');
    menu?.classList.remove('open');
    document.body.classList.remove('menu-open');
  };
  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    menu?.setAttribute('aria-hidden', String(open));
    menu?.classList.toggle('open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });

  if (window.matchMedia('(pointer:fine)').matches) {
    let mouseX = -100, mouseY = -100, ringX = -100, ringY = -100;
    window.addEventListener('mousemove', (event) => {
      mouseX = event.clientX; mouseY = event.clientY;
      dot.style.opacity = '1'; ring.style.opacity = '1';
      dot.style.transform = `translate3d(${mouseX}px,${mouseY}px,0)`;
    });
    const follow = () => {
      ringX += (mouseX - ringX) * .14; ringY += (mouseY - ringY) * .14;
      ring.style.transform = `translate3d(${ringX}px,${ringY}px,0)`;
      requestAnimationFrame(follow);
    };
    follow();
    document.querySelectorAll('a,button,[data-tilt]').forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('hover'));
      el.addEventListener('mouseleave', () => ring.classList.remove('hover'));
    });
    document.querySelectorAll('.magnetic').forEach((el) => {
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        el.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = '');
    });
    document.querySelectorAll('[data-tilt]').forEach((el) => {
      const base = getComputedStyle(el).transform;
      el.addEventListener('mousemove', (event) => {
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - .5;
        const y = (event.clientY - rect.top) / rect.height - .5;
        el.style.transform = `${base} rotateX(${-y * 7}deg) rotateY(${x * 9}deg) translateZ(8px)`;
      });
      el.addEventListener('mouseleave', () => el.style.transform = base);
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());
})();
