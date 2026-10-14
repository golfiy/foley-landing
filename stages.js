/* Stages (Hire / Onboard / Monitor + Insights): hover / focus / tap state machine.
   Ported from ../foley-stages, with a small public API for the landing page:
   window.FoleyStages.hint()  – plays each state once so touch users see what hover does */
(() => {
  const params = new URLSearchParams(location.search);
  const stages = [...document.querySelectorAll('[data-stage]')];
  if (!stages.length) return;
  const byName = Object.fromEntries(stages.map((el) => [el.dataset.stage, el]));
  const slow = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--slow')) || 1;

  let forced = null;      // stage pinned by ?shot=<name>
  let lastPointer = 'mouse';
  let hinting = false;
  let hintTimer = 0;
  let interacted = false;   // once the user touches the stages, the auto demo never runs

  /* ---------- state ---------- */
  function setActive(el) { stages.forEach((s) => s.classList.toggle('is-active', s === el)); }
  function clear(el) {
    if (el) el.classList.remove('is-active');
    else stages.forEach((s) => s.classList.remove('is-active'));
  }
  const hasVisibleFocus = (el) => !!el.querySelector(':focus-visible');

  /* ---------- hint (auto demo of the hover states) ---------- */
  function endHint(clearStage) {
    if (!hinting) return;
    hinting = false;
    clearTimeout(hintTimer);
    if (clearStage) clear();
  }
  function hint() {
    if (hinting || forced || interacted) return;
    const order = ['hire', 'onboard', 'monitor', 'insights'];
    let i = 0;
    hinting = true;
    const step = () => {
      if (!hinting) return;
      if (i >= order.length) { endHint(true); return; }
      setActive(byName[order[i++]]);
      hintTimer = setTimeout(step, 1500 * slow());
    };
    step();
  }

  /* ---------- mouse / pen ---------- */
  stages.forEach((el) => {
    el.addEventListener('pointerenter', (e) => {
      if (forced || e.pointerType === 'touch') return;
      interacted = true;
      endHint(false);
      setActive(el);
    });
    el.addEventListener('pointerleave', (e) => {
      if (forced || e.pointerType === 'touch') return;
      if (!hasVisibleFocus(el)) clear(el);
    });

    /* keyboard: Tab into a column opens it, Tab out closes it */
    el.addEventListener('focusin', (e) => {
      if (forced) return;
      if (e.target.matches(':focus-visible')) { interacted = true; endHint(false); setActive(el); }
    });
    el.addEventListener('focusout', (e) => {
      if (forced) return;
      if (!el.contains(e.relatedTarget) && !el.matches(':hover')) clear(el);
    });

    /* touch: first tap opens, taps on links inside an open column navigate */
    el.addEventListener('click', (e) => {
      if (forced || lastPointer !== 'touch') return;
      if (!el.classList.contains('is-active')) {
        e.preventDefault();
        interacted = true;
        endHint(false);
        setActive(el);
      }
    });
  });

  document.addEventListener('pointerdown', (e) => {
    lastPointer = e.pointerType || 'mouse';
    if (forced || lastPointer !== 'touch') return;
    if (!e.target.closest('[data-stage]')) clear();
  }, true);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !forced) {
      const open = stages.find((s) => s.classList.contains('is-active'));
      endHint(true);
      clear();
      if (open && open.contains(document.activeElement)) document.activeElement.blur();
    }
  });

  /* ---------- product cards scale to the column ---------- */
  const DESIGN_W = 398;      // column inner width in the 1280 layout
  const bodies = [...document.querySelectorAll('.stage-body')];
  function fit(body, width = body.clientWidth) {
    const product = body.querySelector('.product');
    if (product && width) product.style.setProperty('--z', Math.min(1, width / DESIGN_W).toFixed(4));
  }
  bodies.forEach((b) => fit(b));
  const ro = new ResizeObserver((entries) => entries.forEach((e) => fit(e.target, e.contentRect.width)));
  bodies.forEach((b) => ro.observe(b));

  /* ---------- review mode: ?shot=<stage> pins a stage ---------- */
  function pin(name) {
    if (name === 'all') { forced = 'all'; stages.forEach((s) => s.classList.add('is-active')); return; }   // matches the Figma hover-states frame
    forced = name && byName[name] ? name : null;
    if (forced) setActive(byName[forced]); else clear();
  }
  if (params.has('shot') && params.get('shot')) pin(params.get('shot'));

  window.FoleyStages = {
    setActive: (name) => { interacted = true; endHint(false); setActive(byName[name] || null); },
    clear: () => { interacted = true; endHint(false); clear(); },
    pin,
    hint,
    stop: () => endHint(true),
  };
})();
