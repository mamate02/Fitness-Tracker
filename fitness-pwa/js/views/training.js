import { db } from '../db.js';

// Entwurf des aktuell laufenden Trainings (im Speicher, bis es abgeschlossen wird)
let draftEntries = [];

export function renderTraining(container) {
  const exercises = db.getExercises();

  container.innerHTML = `
    <header class="page-header">
      <div>
        <p class="eyebrow">${formatDate(new Date())}</p>
        <h1>Neues Training</h1>
      </div>
    </header>

    <div class="card picker-card">
      <label class="field-label" for="exercise-input">Übung hinzufügen</label>
      <div class="picker-row">
        <input type="text" id="exercise-input" list="exercise-options" placeholder="Übung suchen oder neu anlegen" />
        <datalist id="exercise-options">
          ${exercises.map((e) => `<option value="${escapeHtml(e.name)}"></option>`).join('')}
        </datalist>
        <button id="add-exercise-btn" class="btn-icon" type="button" aria-label="Übung hinzufügen">+</button>
      </div>
    </div>

    <div id="entries-list">
      ${
        draftEntries.length === 0
          ? '<div class="card empty-state">Noch keine Übung hinzugefügt.</div>'
          : draftEntries.map((entry, i) => renderEntryCard(entry, i)).join('')
      }
    </div>

    <button id="finish-training" class="btn-primary sticky-btn" type="button" ${
      totalSets() === 0 ? 'disabled' : ''
    }>
      Training abschließen
    </button>
  `;

  attachHandlers(container);
}

function renderEntryCard(entry, entryIndex) {
  return `
    <div class="card exercise-card">
      <div class="exercise-card-header">
        <h3>${escapeHtml(entry.exerciseName)}</h3>
        <button class="link-btn danger" data-remove-exercise="${entryIndex}" type="button">Entfernen</button>
      </div>
      <div class="sets-list">
        ${
          entry.sets.length === 0
            ? '<p class="hint-text">Noch kein Satz erfasst.</p>'
            : entry.sets
                .map(
                  (set, setIndex) => `
          <div class="set-row">
            <span class="set-index">${setIndex + 1}</span>
            <input type="number" inputmode="decimal" class="set-weight-input" value="${set.weight}" data-entry="${entryIndex}" data-set="${setIndex}" placeholder="Gewicht" />
            <span class="set-unit">kg</span>
            <button class="icon-btn" data-remove-set="${entryIndex}:${setIndex}" type="button" aria-label="Satz entfernen">✕</button>
          </div>`
                )
                .join('')
        }
      </div>
      <button class="btn-secondary" data-add-set="${entryIndex}" type="button">+ Satz hinzufügen</button>
    </div>
  `;
}

function totalSets() {
  return draftEntries.reduce((sum, e) => sum + e.sets.length, 0);
}

function attachHandlers(container) {
  container.querySelector('#add-exercise-btn').addEventListener('click', () => addExercise(container));
  container.querySelector('#exercise-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExercise(container);
    }
  });

  container.querySelectorAll('[data-add-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const entryIndex = Number(btn.dataset.addSet);
      draftEntries[entryIndex].sets.push({ weight: 0 });
      renderTraining(container);
    });
  });

  container.querySelectorAll('[data-remove-set]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const [entryIndex, setIndex] = btn.dataset.removeSet.split(':').map(Number);
      draftEntries[entryIndex].sets.splice(setIndex, 1);
      renderTraining(container);
    });
  });

  container.querySelectorAll('[data-remove-exercise]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const entryIndex = Number(btn.dataset.removeExercise);
      draftEntries.splice(entryIndex, 1);
      renderTraining(container);
    });
  });

  container.querySelectorAll('.set-weight-input').forEach((input) => {
    input.addEventListener('input', () => {
      const entryIndex = Number(input.dataset.entry);
      const setIndex = Number(input.dataset.set);
      const value = parseFloat(input.value.replace(',', '.'));
      draftEntries[entryIndex].sets[setIndex].weight = isNaN(value) ? 0 : value;
    });
  });

  const finishBtn = container.querySelector('#finish-training');
  if (finishBtn) {
    finishBtn.addEventListener('click', () => {
      if (totalSets() === 0) return;
      db.addWorkout(draftEntries.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets })));
      draftEntries = [];
      window.location.hash = '#/activities';
    });
  }
}

function addExercise(container) {
  const input = container.querySelector('#exercise-input');
  const name = input.value.trim();
  if (!name) return;

  let exercise = db.getExercises().find((e) => e.name.toLowerCase() === name.toLowerCase());
  if (!exercise) {
    exercise = db.addExercise(name);
  }

  if (!draftEntries.some((entry) => entry.exerciseId === exercise.id)) {
    draftEntries.push({ exerciseId: exercise.id, exerciseName: exercise.name, sets: [] });
  }
  input.value = '';
  renderTraining(container);
}

function formatDate(date) {
  return date.toLocaleDateString('de-AT', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
