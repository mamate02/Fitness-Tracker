// Datenhaltung im Browser (localStorage) - kein Server nötig.
//
// Datenmodell:
// exercises: [{ id, name }]
// workouts:  [{ id, date, entries: [{ exerciseId, sets: [{ weight }] }] }]

const EXERCISES_KEY = 'ft_exercises';
const WORKOUTS_KEY = 'ft_workouts';

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Fehler beim Lesen von', key, e);
    return fallback;
  }
}

function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const db = {
  getExercises() {
    return readJSON(EXERCISES_KEY, []).slice().sort((a, b) => a.name.localeCompare(b.name, 'de'));
  },

  addExercise(name) {
    const exercises = readJSON(EXERCISES_KEY, []);
    const exercise = { id: uid(), name: name.trim() };
    exercises.push(exercise);
    writeJSON(EXERCISES_KEY, exercises);
    return exercise;
  },

  deleteExercise(id) {
    const exercises = readJSON(EXERCISES_KEY, []).filter((e) => e.id !== id);
    writeJSON(EXERCISES_KEY, exercises);
    const workouts = readJSON(WORKOUTS_KEY, []).map((w) => ({
      ...w,
      entries: w.entries.filter((entry) => entry.exerciseId !== id),
    }));
    writeJSON(WORKOUTS_KEY, workouts);
  },

  getWorkouts() {
    return readJSON(WORKOUTS_KEY, []).slice().sort((a, b) => b.date.localeCompare(a.date));
  },

  addWorkout(entries, date = new Date().toISOString().slice(0, 10)) {
    const workouts = readJSON(WORKOUTS_KEY, []);
    const workout = { id: uid(), date, entries };
    workouts.push(workout);
    writeJSON(WORKOUTS_KEY, workouts);
    return workout;
  },

  deleteWorkout(id) {
    const workouts = readJSON(WORKOUTS_KEY, []).filter((w) => w.id !== id);
    writeJSON(WORKOUTS_KEY, workouts);
  },

  // Verlauf einer Übung über alle Trainings, aufsteigend nach Datum sortiert.
  // totalWeight = Summe der Gewichte aller Sätze dieser Übung in diesem Training (kumulatives Gewicht).
  getHistoryForExercise(exerciseId) {
    const workouts = this.getWorkouts().slice().sort((a, b) => a.date.localeCompare(b.date));
    const history = [];
    for (const workout of workouts) {
      const entry = workout.entries.find((e) => e.exerciseId === exerciseId);
      if (entry && entry.sets.length > 0) {
        const totalWeight = entry.sets.reduce((sum, s) => sum + s.weight, 0);
        history.push({
          date: workout.date,
          setsCount: entry.sets.length,
          totalWeight,
        });
      }
    }
    return history;
  },

  getWeeklyStats() {
    const workouts = this.getWorkouts();
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    const recentWorkouts = workouts.filter((w) => new Date(w.date) >= weekAgo);
    const totalSets = recentWorkouts.reduce(
      (sum, w) => sum + w.entries.reduce((s, e) => s + e.sets.length, 0),
      0
    );
    return { workoutCount: recentWorkouts.length, totalSets };
  },
};
