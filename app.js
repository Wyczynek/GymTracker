// ============================================
// MAIN APPLICATION
// ============================================

const appState = {
  currentView: 'dashboard'
};

// ============================================
// VIEW MANAGEMENT
// ============================================
function showView(viewName) {
  // Hide all views
  document.getElementById('dashboard-view').style.display = 'none';
  document.getElementById('calendar-view').style.display = 'none';
  document.getElementById('session-view').style.display = 'none';

  // Show selected view
  document.getElementById(`${viewName}-view`).style.display = 'block';

  // Update navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.view === viewName) {
      item.classList.add('active');
    }
  });

  appState.currentView = viewName;
}

// Navigation click handlers
document.querySelectorAll('.nav-item').forEach(item => {
  item.addEventListener('click', () => {
    showView(item.dataset.view);
  });
});

// ============================================
// SESSION MANAGEMENT
// ============================================

// Start new session
document.getElementById('new-session-btn').addEventListener('click', () => {
  sessionManager.startNewSession();
  sessionUI.renderExercises();
  showView('session');
});

// End session
document.getElementById('end-session-btn').addEventListener('click', () => {
  if (sessionManager.currentSession) {
    if (confirm('Are you sure you want to end this session?')) {
      const completedSession = sessionManager.endSession();
      sessionUI.renderExercises();
      updateDashboard();
      showView('dashboard');
      console.log('Session completed:', completedSession);
    }
  }
});

// Add exercise
document.getElementById('add-exercise-btn').addEventListener('click', () => {
  sessionUI.showAddExerciseModal();
});

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
  const sessions = sessionManager.getAllSessions();

  // Total sessions
  document.getElementById('total-sessions').textContent = sessions.length;

  // This week sessions
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= weekStart;
  });

  document.getElementById('week-sessions').textContent = weekSessions.length;

  // Current streak (simplified - consecutive days with sessions)
  const sortedSessions = sessions
    .map(s => new Date(s.date))
    .sort((a, b) => b - a);

  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedSessions.length; i++) {
    const sessionDate = new Date(sortedSessions[i]);
    sessionDate.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((currentDate - sessionDate) / (1000 * 60 * 60 * 24));

    if (diffDays === streak) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays > streak) {
      break;
    }
  }

  document.getElementById('current-streak').textContent = streak;

  // Render recent sessions
  renderRecentSessions(sessions);
}

function renderRecentSessions(sessions) {
  const container = document.getElementById('recent-sessions-list');

  if (sessions.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p>No sessions yet. Start your first workout!</p>
      </div>
    `;
    return;
  }

  // Show last 5 sessions
  const recentSessions = sessions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  container.innerHTML = recentSessions.map(session => {
    const date = new Date(session.date);
    const duration = session.duration ? formatDuration(session.duration) : 'N/A';
    const exerciseCount = session.exercises ? session.exercises.length : 0;

    return `
      <div class="session-list-item">
        <div class="session-date">${date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</div>
        <div class="session-meta">${exerciseCount} exercises • ${duration}</div>
      </div>
    `;
  }).join('');
}

function formatDuration(ms) {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ============================================
// CALENDAR INTEGRATION POINTS
// ============================================

document.getElementById('prev-month').addEventListener('click', () => {
  console.log('🔗 Integration Point: Navigate to previous month');
  // TODO: Implement calendar navigation
});

document.getElementById('next-month').addEventListener('click', () => {
  console.log('🔗 Integration Point: Navigate to next month');
  // TODO: Implement calendar navigation
});

// ============================================
// INITIALIZATION
// ============================================

updateDashboard();
console.log('🚀 Gym Tracker initialized');
