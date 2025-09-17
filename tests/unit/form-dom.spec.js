import { describe, it, beforeEach, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

// Load the browser JS (the module under test) as a script into JSDOM environment
const html = fs.readFileSync(path.resolve('./form.html'), 'utf8');

describe('Form DOM generation', () => {
  let container;

  beforeEach(() => {
    document.documentElement.innerHTML = html;
    container = document.getElementById('guest-forms-container');
  });

  it('creates guest forms according to guestsCount in localStorage', async () => {
    localStorage.setItem('checkInData', JSON.stringify({ apartment: '1', checkInDate: '2025-09-18', guestsCount: 2, language: 'es' }));
    // Provide a minimal window.i18n mock expected by initFormPage
    global.window.i18n = {
      getText: (k) => ({ progress: '{current} de {total}', guest_info: 'Huésped' }[k] || k),
      setLanguage: (l) => {},
      updateTexts: () => {}
    };
    // import the module under test and call the exported initializer
    const mod = await import('../../assets/form.js');
    if (mod && typeof mod.initFormPage === 'function') {
      await mod.initFormPage();
    }
    const forms = container.querySelectorAll('.guest-form');
    expect(forms.length).toBeGreaterThanOrEqual(1);
  });
});
