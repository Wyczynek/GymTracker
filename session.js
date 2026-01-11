  // ============================================
// SESSION MANAGEMENT
// ============================================

class SessionManager {
  constructor() {
    this.currentSession = null;
    this.exercises = [];
    this.startTime = null;
    this.timerInterval = null;
  }

  startNewSession() {
    this.currentSession = {
      id: Date.now(),
      date: new Date().toISOString(),
      startTime: Date.now(),
      exercises: []
    };
    this.exercises = [];
    this.startTime = Date.now();
    this.startTimer();
    this.updateSessionInfo();
  }

  startTimer() {
    this.timerInterval = setInterval(() => {
      const elapsed = Date.now() - this.startTime;
      const hours = Math.floor(elapsed / 3600000);
      const minutes = Math.floor((elapsed % 3600000) / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);

      const timerElement = document.getElementById('session-duration');
      if (timerElement) {
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      }
    }, 1000);
  }

  updateSessionInfo() {
    const dateElement = document.getElementById('session-date');
    if (dateElement) {
      const today = new Date();
      dateElement.textContent = today.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  }

  endSession() {
    if (!this.currentSession) return null;

    clearInterval(this.timerInterval);

    this.currentSession.endTime = Date.now();
    this.currentSession.duration = this.currentSession.endTime - this.currentSession.startTime;
    this.currentSession.exercises = this.exercises.map(ex => ({...ex}));

    // Save to local storage
    const sessions = this.getAllSessions();
    sessions.push(this.currentSession);
    localStorage.setItem('gymTrackerSessions', JSON.stringify(sessions));

    const completedSession = {...this.currentSession};

    // Reset session
    this.currentSession = null;
    this.exercises = [];
    this.startTime = null;

    return completedSession;
  }

  getAllSessions() {
    const data = localStorage.getItem('gymTrackerSessions');
    return data ? JSON.parse(data) : [];
  }

  addExercise(exercise) {
    this.exercises.push(exercise);
    if (this.currentSession) {
      this.currentSession.exercises = this.exercises;
    }
  }

  removeExercise(exerciseId) {
    this.exercises = this.exercises.filter(ex => ex.id !== exerciseId);
    if (this.currentSession) {
      this.currentSession.exercises = this.exercises;
    }
  }

  updateExercise(exerciseId, updatedExercise) {
    const index = this.exercises.findIndex(ex => ex.id === exerciseId);
    if (index !== -1) {
      this.exercises[index] = {...this.exercises[index], ...updatedExercise};
      if (this.currentSession) {
        this.currentSession.exercises = this.exercises;
      }
    }
  }
}

// Export singleton instance
const sessionManager = new SessionManager();
