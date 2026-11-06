/* Skeezad / cinematic presentation, motion controls and accessible film player. */
(() => {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const clips = [...document.querySelectorAll('[data-auto-video]')];
  const dialog = document.querySelector('#film-dialog');
  const player = document.querySelector('#film-player');
  const toggle = document.querySelector('#ambient-toggle');
  let backgroundPaused = preference.matches;
  let lastTrigger = null;

  function updatePlayback() {
    const stop = backgroundPaused || document.hidden || dialog.open;
    clips.forEach(video => {
      if (!stop && video.dataset.visible === 'true') {
        video.muted = true;
        video.play().catch(() => {});
      } else video.pause();
    });
    document.body.classList.toggle('motion-paused', backgroundPaused);
    if (toggle) {
      toggle.setAttribute('aria-pressed', String(backgroundPaused));
      toggle.textContent = backgroundPaused ? '▷ RESUME BACKGROUND MOTION' : 'Ⅱ PAUSE BACKGROUND MOTION';
    }
    window.dispatchEvent(new CustomEvent('skeezad:motion', {detail: {paused: stop}}));
  }
  const visibility = new IntersectionObserver(entries => {
    entries.forEach(({target, isIntersecting}) => target.dataset.visible = String(isIntersecting));
    updatePlayback();
  }, {threshold: .05});
  clips.forEach(video => visibility.observe(video));
  toggle?.addEventListener('click', () => {backgroundPaused = !backgroundPaused; updatePlayback();});
  preference.addEventListener('change', e => {backgroundPaused = e.matches; updatePlayback();});
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && dialog.open) player.pause();
    updatePlayback();
  });
  document.querySelectorAll('[data-film]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      lastTrigger = trigger;
      document.querySelector('#film-dialog-title').textContent = trigger.dataset.title;
      player.src = trigger.dataset.film;
      player.poster = trigger.dataset.film.replace('.mp4', '-poster.webp');
      dialog.showModal();
      document.body.classList.add('film-open');
      updatePlayback();
      player.play().catch(() => {});
    });
  });
  document.querySelector('#close-film').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    player.pause();
    player.removeAttribute('src');
    player.load();
    document.body.classList.remove('film-open');
    updatePlayback();
    lastTrigger?.focus({preventScroll: true});
  });

  // Stagger adjacent cards without delaying an entire section.
  document.querySelectorAll('.expertise-card').forEach((card, i) => card.style.setProperty('--reveal-delay', `${i % 4 * 80}ms`));
  document.querySelectorAll('.film-card').forEach((card, i) => card.style.setProperty('--reveal-delay', `${i * 120}ms`));
  const cards = [...document.querySelectorAll('.expertise-card')];
  const halo = document.querySelector('.pointer-halo');
  if (matchMedia('(pointer: fine)').matches && !preference.matches) {
    cards.forEach(card => {
      let pending = 0;
      card.addEventListener('pointermove', e => {
        if (pending || backgroundPaused) return;
        pending = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width;
          const y = (e.clientY - rect.top) / rect.height;
          card.style.setProperty('--spot-x', `${x * 100}%`);
          card.style.setProperty('--spot-y', `${y * 100}%`);
          card.style.transform = `perspective(1000px) rotateX(${(0.5-y)*4}deg) rotateY(${(x-.5)*5}deg) translateY(-7px)`;
          pending = 0;
        });
      });
      card.addEventListener('pointerleave', () => {
        cancelAnimationFrame(pending); pending = 0; card.style.transform = '';
      });
    });
    let pendingPointer = 0;
    window.addEventListener('pointermove', e => {
      if (pendingPointer || backgroundPaused) return;
      pendingPointer = requestAnimationFrame(() => {
        halo.style.left = e.clientX + 'px'; halo.style.top = e.clientY + 'px'; halo.style.opacity = '1'; pendingPointer = 0;
      });
    }, {passive:true});
    document.documentElement.addEventListener('pointerleave', () => {halo.style.opacity = '0';});
  }
  const band = document.querySelector('.perspective-band');
  const words = document.querySelector('.perspective-inner');
  let bandVisible = false, scrollFrame = 0;
  new IntersectionObserver(entries => {bandVisible = entries[0].isIntersecting;}, {rootMargin:'80px'}).observe(band);
  window.addEventListener('scroll', () => {
    if (!bandVisible || scrollFrame || backgroundPaused || preference.matches) return;
    scrollFrame = requestAnimationFrame(() => {
      const rect = band.getBoundingClientRect();
      const progress = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - innerHeight / 2) / innerHeight));
      words.style.transform = `translateY(${progress * 24}px) rotate(${progress * -1.4}deg)`;
      scrollFrame = 0;
    });
  }, {passive:true});
  updatePlayback();
})();
