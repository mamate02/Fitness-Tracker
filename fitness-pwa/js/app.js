import { renderHome } from './views/home.js';
import { renderTraining } from './views/training.js';
import { renderActivities } from './views/activities.js';
import { renderStatistics } from './views/statistics.js';

const routes = {
  '#/home': renderHome,
  '#/training': renderTraining,
  '#/activities': renderActivities,
  '#/statistics': renderStatistics,
};

const appEl = document.getElementById('app');
const navButtons = document.querySelectorAll('.nav-btn');

function setActiveNav(hash) {
  navButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.route === hash);
  });
}

function router() {
  const hash = window.location.hash || '#/home';
  const render = routes[hash] || renderHome;
  setActiveNav(routes[hash] ? hash : '#/home');
  render(appEl);
  window.scrollTo(0, 0);
}

window.addEventListener('hashchange', router);
window.addEventListener('DOMContentLoaded', router);

navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    window.location.hash = btn.dataset.route;
  });
});
