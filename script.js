(function () {
  if (typeof gsap === 'undefined') {
    // Fallback: IntersectionObserver for pages without GSAP CDN
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('[data-animate]').forEach(el => observer.observe(el));

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      });
    });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('gsap-ready');

  const isTouch = matchMedia('(hover: none)').matches;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduce) gsap.globalTimeline.timeScale(1000);

  // Lenis smooth scroll — desktop only
  let lenis;
  if (!isTouch && !reduce) {
    lenis = new Lenis({ lerp: 0.08, smoothWheel: true, autoRaf: false });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  // Hero stagger — runs only on pages with the hero headline
  if (document.querySelector('.hero-headline')) {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } });
    tl.from('.hero-badge',    { y: 16, opacity: 0, duration: 0.7 })
      .from('.hero-headline', { y: 44, opacity: 0, duration: 1.1 }, '-=0.5')
      .from('.hero-sub',      { y: 22, opacity: 0 }, '-=0.7')
      .from('.hero-actions',  { y: 18, opacity: 0 }, '-=0.65')
      .from('.hero-stats',    { y: 18, opacity: 0 }, '-=0.55');
  }

  // Single scroll reveals
  gsap.utils.toArray('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      y: 32, opacity: 0, duration: 0.9, ease: 'power3.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none reverse',
      },
    });
  });

  // Batched reveals for grids and lists
  ScrollTrigger.batch('[data-reveal-batch]', {
    onEnter: (els) =>
      gsap.from(els, { y: 32, opacity: 0, stagger: 0.1, duration: 0.85, ease: 'power3.out' }),
    onLeaveBack: (els) =>
      gsap.to(els, { y: 32, opacity: 0, stagger: 0.05, duration: 0.35, ease: 'power2.in' }),
    start: 'top 88%',
  });

  // Legacy [data-animate] elements — sub-pages (services.html, portfolio.html)
  gsap.utils.toArray('[data-animate]').forEach((el) => {
    const i = parseFloat(el.style.getPropertyValue('--i') || '0');
    gsap.fromTo(
      el,
      { y: 32, opacity: 0 },
      {
        y: 0, opacity: 1,
        duration: 0.9, ease: 'power3.out',
        delay: i * 0.12,
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none reverse',
        },
      }
    );
  });

  // Nav: compact on scroll
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    ScrollTrigger.create({
      start: 'top -60',
      onUpdate: (self) => navbar.classList.toggle('scrolled', self.progress > 0),
    });
  }

  // Desktop-only interactions
  if (!isTouch) {
    // Magnetic buttons
    document.querySelectorAll('[data-magnetic]').forEach((el) => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.28, y: y * 0.28, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('mouseleave', () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
      });
    });

    // Custom cursor
    const cursor = document.getElementById('cursor');
    if (cursor) {
      document.addEventListener('mousemove', (e) => {
        cursor.classList.add('is-visible');
        gsap.to(cursor, {
          x: e.clientX, y: e.clientY,
          duration: 0.12, ease: 'power2.out', overwrite: 'auto',
        });
      });
      document.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));

      document.querySelectorAll('a, button, [data-magnetic]').forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('is-active'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('is-active'));
      });
    }
  }

  // Smooth anchor scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      if (lenis) {
        lenis.scrollTo(target, { duration: 1.2 });
      } else {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
})();
