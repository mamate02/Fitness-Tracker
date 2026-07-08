import { db } from '../db.js';

export function renderActivities(container) {
  const workouts = db.getWorkouts();

  container.innerHTML = `
    <header class="page-header">
      <div>
        <p class="eyebrow">Verlauf</p>
        <h1>Aktivitäten</h1>
      </div>
    </header>

    ${
      workouts.length === 0
        ? '<div class="card empty-state">Noch keine Trainings gespeichert.</div>'
        : workouts.map((w) => renderWorkoutCard(w)).join('')
    }
  `;

  container.querySelectorAll('.activity-card').forEach((card) => {
    card.querySelector('.activity-summary-row').addEventListener('click', () => {
      card.classList.toggle('expanded');
    });
  });

  container.querySelectorAll('[data-delete-workout]').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (confirm('Dieses Training wirklich löschen?')) {
        db.deleteWorkout(btn.dataset.deleteWorkout);
        renderActivities(container);
      }
    });
  });
}

function renderWorkoutCard(workout) {
  const totalSets = workout.entries.reduce((s, e) => s + e.sets.length, 0);
  return `
    <div class="card activity-card">
      <div class="activity-summary-row">
        <div>
          <p class="activity-date">${formatDate(workout.date)}</p>
          <p class="activity-summary">${workout.entries.length} Übung${
    workout.entries.length === 1 ? '' : 'en'
  } · ${totalSets} Sätze</p>
        </div>
        <span class="chevron">›</span>
      </div>
      <div class="activity-details">
        ${workout.entries
          .map(
            (entry) => `
          <div class="detail-exercise">
            <p class="detail-exercise-name">${escapeHtml(exerciseName(entry.exerciseId))}</p>
            <p class="detail-sets">${entry.sets.map((s) => `${s.weight} kg`).join(' · ') || 'Keine Sätze'}</p>
          </div>`
          )
          .join('')}
        <button class="link-btn danger" data-delete-workout="${workout.id}" type="button">Training löschen</button>
      </div>
    </div>
  `;
}

function exerciseName(id) {
  const exercise = db.getExercises().find((e) => e.id === id);
  return exercise ? exercise.name : 'Gelöschte Übung';
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-AT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
