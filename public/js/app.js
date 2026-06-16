const navToggle = document.querySelector('[data-nav-toggle]');
const nav = document.querySelector('[data-nav]');

if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('is-open', !expanded);
  });
}

const civilServantToggle = document.querySelector('[data-civil-servant-toggle]');
const civilServantDetails = document.querySelector('[data-civil-servant-details]');

if (civilServantToggle && civilServantDetails) {
  const syncCivilServantDetails = () => {
    civilServantDetails.classList.toggle('is-hidden', !civilServantToggle.checked);
  };
  civilServantToggle.addEventListener('change', syncCivilServantDetails);
  syncCivilServantDetails();
}

for (const form of document.querySelectorAll('form[data-confirm]')) {
  form.addEventListener('submit', (event) => {
    if (!window.confirm(form.dataset.confirm)) {
      event.preventDefault();
    }
  });
}

for (const button of document.querySelectorAll('[data-print]')) {
  button.addEventListener('click', () => window.print());
}
