// ============================================
// SESSION MANAGEMENT
// ============================================

class SessionManager {
  constructor() {
    this.exercises = [];
    this.selectedDate = null;
  }

  initSession() {
    const today = new Date();
    const dateStr = today.toISOString().split('T')[0];
    this.selectedDate = dateStr;

    // Set date input to today
    const dateInput = document.getElementById('session-date-input');
    if (dateInput) {
      dateInput.value = dateStr;
    }
  }

  setSessionDate(dateStr) {
    this.selectedDate = dateStr;
  }

  saveSession() {
    const session = {
      id: Date.now(),
      date: this.selectedDate || new Date().toISOString().split('T')[0],
      exercises: this.exercises.map(ex => ({...ex}))
    };

    // Save to local storage
    const sessions = this.getAllSessions();
    sessions.push(session);
    localStorage.setItem('gymTrackerSessions', JSON.stringify(sessions));

    const savedSession = {...session};

    // Reset exercises for new session
    this.exercises = [];

    return savedSession;
  }

  getAllSessions() {
    const data = localStorage.getItem('gymTrackerSessions');
    return data ? JSON.parse(data) : [];
  }

  addExercise(exercise) {
    this.exercises.push(exercise);
  }

  removeExercise(exerciseId) {
    this.exercises = this.exercises.filter(ex => ex.id !== exerciseId);
  }

  updateExercise(exerciseId, updatedExercise) {
    const index = this.exercises.findIndex(ex => ex.id === exerciseId);
    if (index !== -1) {
      this.exercises[index] = {...this.exercises[index], ...updatedExercise};
    }
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
