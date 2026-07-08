import { db } from '../db.js';

let chartInstance = null;

export function renderStatistics(container) {
  const exercises = db.getExercises();

  container.innerHTML = `
    <header class="page-header">
      <div>
        <p class="eyebrow">Fortschritt</p>
        <h1>Statistik</h1>
      </div>
    </header>

    ${
      exercises.length === 0
        ? '<div class="card empty-state">Lege zuerst Übungen an (im Tab "Training"), um hier Verläufe zu sehen.</div>'
        : `
          <div class="chip-row" id="exercise-chips">
            ${exercises
              .map(
                (e, i) =>
                  `<button class="chip ${i === 0 ? 'chip-active' : ''}" data-exercise="${e.id}" type="button">${escapeHtml(
                    e.name
                  )}</button>`
              )
              .join('')}
          </div>
          <div class="card chart-card">
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot legend-dot-weight"></span>Gesamtgewicht (kg)</span>
              <span class="legend-item"><span class="legend-dot legend-dot-sets"></span>Sätze</span>
            </div>
            <canvas id="history-chart" height="220"></canvas>
          </div>
          <div id="no-data-msg"></div>
        `
    }
  `;

  if (exercises.length === 0) return;

  container.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip').forEach((c) => c.classList.remove('chip-active'));
      chip.classList.add('chip-active');
      drawChart(chip.dataset.exercise, container);
    });
  });

  drawChart(exercises[0].id, container);
}

function drawChart(exerciseId, container) {
  const history = db.getHistoryForExercise(exerciseId);
  const canvas = container.querySelector('#history-chart');
  const msgEl = container.querySelector('#no-data-msg');

  if (chartInstance) {
    chartInstance.destroy();
    chartInstance = null;
  }

  if (history.length === 0) {
    canvas.style.display = 'none';
    msgEl.innerHTML = '<div class="card empty-state">Für diese Übung liegen noch keine Trainingsdaten vor.</div>';
    return;
  }

  canvas.style.display = 'block';
  msgEl.innerHTML = '';

  const labels = history.map((h) => formatShortDate(h.date));

  chartInstance = new Chart(canvas.getContext('2d'), {
    data: {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Sätze',
          data: history.map((h) => h.setsCount),
          backgroundColor: 'rgba(123, 97, 255, 0.25)',
          yAxisID: 'ySets',
          borderRadius: 6,
          maxBarThickness: 28,
        },
        {
          type: 'line',
          label: 'Gesamtgewicht (kg)',
          data: history.map((h) => h.totalWeight),
          borderColor: '#FF5C8A',
          backgroundColor: '#FF5C8A',
          yAxisID: 'yWeight',
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: '#FF5C8A',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        yWeight: {
          type: 'linear',
          position: 'left',
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.05)' },
        },
        ySets: {
          type: 'linear',
          position: 'right',
          beginAtZero: true,
          grid: { display: false },
          ticks: { stepSize: 1, precision: 0 },
        },
        x: {
          grid: { display: false },
        },
      },
    },
  });
}

function formatShortDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-AT', { day: '2-digit', month: '2-digit' });
}

function escapeHtml(str) {
  return str.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
