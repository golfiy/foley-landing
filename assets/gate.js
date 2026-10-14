/*
 * Soft password gate for the public GitHub Pages preview (site + Storybook share one origin,
 * so one unlock covers both). Not security: the repository is public. Only a SHA-256 of the
 * password is stored here. Skipped on local hosts unless the URL has ?gate.
 */
(() => {
  const local = /^(127\.0\.0\.1|localhost)$/.test(location.hostname);
  if (local && !/[?&]gate\b/.test(location.search)) return;
  if (window.top !== window) return; // Storybook preview frames: the manager page is gated

  const HASH = 'b76cb8d85235cce44a70f0c8f90b8002efc04807812ac5fe78775c9c6d313229';
  const KEY = 'foley-gate';
  try { if (localStorage.getItem(KEY) === HASH) return; } catch { /* storage blocked: ask every time */ }

  const FONT = '"Inter Display", Inter, system-ui, sans-serif';
  const css = `
html.is-gated body > :not(.foley-gate) { display: none !important; }
html.is-gated body { overflow: hidden; }
.foley-gate {
  position: fixed; inset: 0; z-index: 2147483647; display: grid; place-items: center; padding: 16px;
  background: #0A171C; color: #fff; font: 400 16px/1.4 ${FONT}; -webkit-font-smoothing: antialiased;
}
.foley-gate-card { width: min(400px, 100%); }
.foley-gate-brand { margin: 0 0 48px; font: 600 14px/1 ${FONT}; letter-spacing: .32px; color: rgba(255, 255, 255, .64); }
.foley-gate-title { margin: 0 0 32px; font: 400 44px/1.05 ${FONT}; letter-spacing: -1px; }
.foley-gate-label { display: block; margin: 0 0 8px; font-size: 14px; color: rgba(255, 255, 255, .64); }
.foley-gate-row { display: flex; }
.foley-gate-input {
  flex: 1; min-width: 0; height: 52px; margin: 0; padding: 0 16px; box-sizing: border-box;
  border: 1px solid rgba(255, 255, 255, .24); border-right: 0; border-radius: 0;
  background: transparent; color: #fff; font: 400 18px/1 ${FONT}; outline: none;
  transition: border-color .2s cubic-bezier(.4, 0, .2, 1);
}
.foley-gate-input:focus { border-color: #fff; }
.foley-gate-btn {
  height: 52px; margin: 0; padding: 0 24px; border: 0; border-radius: 0; cursor: pointer;
  background: #fff; color: #111117; font: 600 18px/1 ${FONT}; letter-spacing: -.5px;
  transition: background-color .2s cubic-bezier(.4, 0, .2, 1);
}
.foley-gate-btn:hover { background: #E9ECF4; }
.foley-gate-btn:focus-visible { outline: 2px solid #81E014; outline-offset: 2px; }
.foley-gate-err { min-height: 20px; margin: 12px 0 0; font-size: 14px; color: rgba(255, 255, 255, .8); }
.foley-gate.is-wrong .foley-gate-row { animation: foley-gate-shake .36s cubic-bezier(.4, 0, .2, 1); }
.foley-gate.is-wrong .foley-gate-input { border-color: rgba(255, 255, 255, .64); }
@keyframes foley-gate-shake { 20%, 60% { transform: translateX(-6px); } 40%, 80% { transform: translateX(6px); } }
@media (prefers-reduced-motion: reduce) { .foley-gate.is-wrong .foley-gate-row { animation: none; } }
`;
  document.documentElement.classList.add('is-gated');
  const st = document.createElement('style');
  st.textContent = css;
  document.head.append(st);

  const sha256 = async (text) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
  };

  const mount = () => {
    const form = document.createElement('form');
    form.className = 'foley-gate';
    form.noValidate = true;
    form.innerHTML = `
      <div class="foley-gate-card">
        <p class="foley-gate-brand">Foley</p>
        <h1 class="foley-gate-title">Private preview</h1>
        <label class="foley-gate-label" for="foley-gate-pw">Password</label>
        <div class="foley-gate-row">
          <input class="foley-gate-input" id="foley-gate-pw" type="password" autocomplete="current-password" spellcheck="false">
          <button class="foley-gate-btn" type="submit">Enter</button>
        </div>
        <p class="foley-gate-err" role="alert" aria-live="assertive"></p>
      </div>`;
    document.body.append(form);
    const input = form.querySelector('input');
    const err = form.querySelector('.foley-gate-err');
    input.focus();
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!input.value) { err.textContent = 'Enter the password'; input.focus(); return; }
      if ((await sha256(input.value)) === HASH) {
        let saved = false;
        try { localStorage.setItem(KEY, HASH); saved = true; } catch { /* storage blocked */ }
        // reload so every script boots against a visible layout; without storage just lift the gate
        if (saved) location.reload();
        else { document.documentElement.classList.remove('is-gated'); form.remove(); }
        return;
      }
      err.textContent = 'Wrong password, try again';
      form.classList.remove('is-wrong');
      void form.offsetWidth;
      form.classList.add('is-wrong');
      input.select();
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
