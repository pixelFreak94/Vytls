// signin.js — the one-time username (DECISIONS 43).
// Asked once per phone, before the loading ball. "Admin" marks a test phone; her email marks hers.
// Nothing leaves the phone: the username only labels this phone's data and its backup files.

import * as store from './store.js';

const el = (tag, props = {}, ...kids) => {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (k === 'class') n.className = v;
    else if (k === 'text') n.textContent = v;
    else if (v === true) n.setAttribute(k, '');
    else if (v !== false && v != null) n.setAttribute(k, v);
  }
  n.append(...kids);
  return n;
};

/** Show the sign-in view. Resolves with the stored form of the username, or null if cancelled
 *  (cancel is offered only when a username is already set, i.e. when changing it from Settings). */
export function askAccount({ current = '' } = {}) {
  return new Promise((resolve) => {
    const input = el('input', {
      class: 'field-input', id: 'signin-name', name: 'username', type: 'text', inputmode: 'email',
      autocomplete: 'off', autocapitalize: 'off', autocorrect: 'off', spellcheck: 'false',
      placeholder: 'name@example.com', 'aria-describedby': 'signin-note',
    });
    input.value = current;
    const note = el('p', { class: 'field-note', id: 'signin-note', role: 'status', hidden: true });
    const field = el('div', { class: 'field' },
      el('label', { class: 'field-label', for: 'signin-name', text: 'username' }),
      el('div', { class: 'field-row' }, input), note);
    const go = el('button', { class: 'btn btn-filled', type: 'submit', text: 'continue' });
    const cancel = current ? el('button', { class: 'btn btn-ghost', type: 'button', text: 'cancel' }) : null;
    const form = el('form', { class: 'signin-form', novalidate: true },
      field, el('div', { class: 'signin-actions' }, ...[go, cancel].filter(Boolean)));
    const view = el('div', { class: 'view signin', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'signin-title' },
      el('div', { class: 'install-body' },
        el('span', { class: 'label label--legible install-eyebrow', text: 'vytls · sign in' }),
        el('h2', { class: 'install-title', id: 'signin-title', text: 'Who is this phone for?' }),
        el('p', { class: 'install-why', text: 'On her own phone, enter her email. On a test phone, enter Admin. Asked once. A test phone makes no backups, and a backup only restores onto a phone with the same username.' }),
        form));

    // fades out like a sheet, then goes (manual §13.4)
    const done = (value) => {
      view.inert = true;
      view.classList.add('is-closing');
      const gone = () => view.remove();
      view.addEventListener('animationend', gone, { once: true });
      setTimeout(gone, (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--d-sheet')) || 0) + 100);
      resolve(value);
    };
    input.addEventListener('input', () => { field.classList.remove('is-error'); note.hidden = true; input.removeAttribute('aria-invalid'); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = store.parseAccount(input.value);
      if (!name) {
        field.classList.add('is-error');
        note.textContent = 'Enter an email, or Admin for a test phone.';
        note.hidden = false;
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      done(name);
    });
    cancel?.addEventListener('click', () => done(null));
    document.body.append(view);
    input.focus({ preventScroll: true });
  });
}
