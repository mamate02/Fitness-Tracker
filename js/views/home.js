import { db } from '../db.js';

export function renderHome(container) {
  const stats = db.getWeeklyStats();
  const workouts = db.getWorkouts();
  const last = workouts[0];

  container.innerHTML = `
    <header class="page-header">
      <div>
        <p class="eyebrow">Willkommen zurück</p>
        <h1>Hallo! 💪</h1>
      </div>
    </header>

    <button class="hero-card" id="start-training" type="button">
      <div>
        <p class="hero-label">Neues Training</p>
        <p class="hero-sub">Übungen &amp; Sätze direkt eintragen</p>
      </div>
      <span class="hero-icon">▶</span>
    </button>

    <div class="tile-row">
      <div class="tile tile-purple">
        <p class="tile-value">${stats.workoutCount}</p>
        <p class="tile-label">Trainings<br>diese Woche</p>
      </div>
      <div class="tile tile-mint">
        <p class="tile-value">${stats.totalSets}</p>
        <p class="tile-label">Sätze<br>diese Woche</p>
      </div>
    </div>

    ${
      last
        ? `<div class="section-title">Letzte Aktivität</div>
           <div class="card activity-preview">
             <p class="activity-date">${formatDate(last.date)}</p>
             <p class="activity-summary">${last.entries.length} Übung${
               last.entries.length === 1 ? '' : 'en'
             } · ${last.entries.reduce((s, e) => s + e.sets.length, 0)} Sätze</p>
           </div>`
        : `<div class="card empty-state">Noch keine Trainings gespeichert. Starte dein erstes Training!</div>`
    }
  `;

  container.querySelector('#start-training').addEventListener('click', () => {
    window.location.hash = '#/training';
  });
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-AT', { weekday: 'long', day: '2-digit', month: '2-digit' });
}
