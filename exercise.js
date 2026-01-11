// ============================================
// EXERCISE MANAGEMENT
// ============================================

class ExerciseManager {
  constructor() {
    this.exerciseHistory = this.loadExerciseHistory();
  }

  loadExerciseHistory() {
    const data = localStorage.getItem('gymTrackerExerciseHistory');
    return data ? JSON.parse(data) : [];
  }

  saveExerciseToHistory(exerciseName) {
    if (!exerciseName || exerciseName.trim() === '') return;

    const normalizedName = exerciseName.trim();

    // Add to history if not already present
    if (!this.exerciseHistory.includes(normalizedName)) {
      this.exerciseHistory.push(normalizedName);
      localStorage.setItem('gymTrackerExerciseHistory', JSON.stringify(this.exerciseHistory));
    }
  }

  getExerciseSuggestions(input) {
    if (!input || input.trim() === '') return [];

    const searchTerm = input.toLowerCase().trim();
    return this.exerciseHistory.filter(name =>
      name.toLowerCase().includes(searchTerm)
    ).sort();
  }

  createExercise(name) {
    this.saveExerciseToHistory(name);

    return {
      id: Date.now(),
      name: name.trim(),
      sets: []
    };
  }

  addSet(exercise, setData) {
    const set = {
      id: Date.now(),
      weight: setData.weight || 0,
      reps: setData.reps || 0,
      rir: setData.rir || 0,
      completed: false
    };
    exercise.sets.push(set);
    return set;
  }

  updateSet(exercise, setId, setData) {
    const set = exercise.sets.find(s => s.id === setId);
    if (set) {
      Object.assign(set, setData);
    }
  }

  removeSet(exercise, setId) {
    exercise.sets = exercise.sets.filter(s => s.id !== setId);
  }

  toggleSetComplete(exercise, setId) {
    const set = exercise.sets.find(s => s.id === setId);
    if (set) {
      set.completed = !set.completed;
    }
  }
}

// Export singleton instance
const exerciseManager = new ExerciseManager();
