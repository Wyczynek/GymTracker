// ============================================
// MAIN APPLICATION
// ============================================

window.appState = {
    currentView: 'dashboard',
};

// ============================================
// VIEW MANAGEMENT
// ============================================
function showView(viewName) {
    // Hide all views
    document.getElementById('dashboard-view').style.display = 'none';
    document.getElementById('calendar-view').style.display = 'none';
    document.getElementById('session-view').style.display = 'none';
    document.getElementById('inspiration-view').style.display = 'none';

    // Show selected view
    document.getElementById(`${viewName}-view`).style.display = 'block';

    // Update navigation
    document.querySelectorAll('.nav-item').forEach((item) => {
        item.classList.remove('active');
        if (item.dataset.view === viewName) {
            item.classList.add('active');
        }
    });

    appState.currentView = viewName;

    // Refresh calendar when switching to it
    if (viewName === 'calendar' && typeof setMode === 'function') {
        setMode('month');
    }

    // ✅ ZAPIS WIDOKU
    localStorage.setItem('currentView', viewName);
}

// Navigation click handlers
document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
        showView(item.dataset.view);
    });
});

// ============================================
// SESSION MANAGEMENT
// ============================================

// Initialize session on load
sessionManager.initSession();

// Add exercise
document.getElementById('add-exercise-btn').addEventListener('click', () => {
    sessionUI.showAddExerciseModal();
});

// Save session
document.getElementById('save-session-btn').addEventListener('click', () => {
    if (sessionManager.exercises.length === 0) {
        alert('Please add at least one exercise before saving.');
        return;
    }

    const completedSession = sessionManager.saveSession();
    sessionUI.renderExercises();
    updateDashboard();
    console.log('Session saved:', completedSession);
});

// Session date picker
document
    .getElementById('session-date-input')
    .addEventListener('change', (e) => {
        sessionManager.setSessionDate(e.target.value);
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

    const weekSessions = sessions.filter((session) => {
        const sessionDate = new Date(session.date);
        return sessionDate >= weekStart;
    });

    document.getElementById('week-sessions').textContent = weekSessions.length;

    // Current streak (simplified - consecutive days with sessions)
    const sortedSessions = sessions
        .map((s) => new Date(s.date))
        .sort((a, b) => b - a);

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedSessions.length; i++) {
        const sessionDate = new Date(sortedSessions[i]);
        sessionDate.setHours(0, 0, 0, 0);

        const diffDays = Math.floor(
            (currentDate - sessionDate) / (1000 * 60 * 60 * 24)
        );

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

    container.innerHTML = recentSessions
        .map((session) => {
            const date = new Date(session.date);
            const exerciseCount = session.exercises
                ? session.exercises.length
                : 0;
            const exercisesList = session.exercises
                ? session.exercises
                      .map((ex) => {
                          const setsCount = ex.sets ? ex.sets.length : 0;
                          return `
        <div class="exercise-item">
          <div class="exercise-name">${ex.name}</div>
          <div class="exercise-sets">${setsCount} sets</div>
        </div>
      `;
                      })
                      .join('')
                : '';

            return `
      <div class="session-list-item" data-session-id="${session.id}">
        <div class="session-header-row" onclick="toggleSessionDetails(${
            session.id
        })">
          <div>
            <div class="session-date">${date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric',
            })}</div>
            <div class="session-meta">${exerciseCount} exercises</div>
          </div>
          <div class="session-toggle">▼</div>
        </div>
        <div class="session-details" id="session-details-${session.id}">
          ${
              exercisesList ||
              '<div class="no-exercises">No exercises recorded</div>'
          }
        </div>
      </div>
    `;
        })
        .join('');
}

function toggleSessionDetails(sessionId) {
    const details = document.getElementById(`session-details-${sessionId}`);
    const sessionItem = document.querySelector(
        `[data-session-id="${sessionId}"]`
    );
    const toggle = sessionItem.querySelector('.session-toggle');

    if (details.style.display === 'block') {
        details.style.display = 'none';
        toggle.textContent = '▼';
        sessionItem.classList.remove('expanded');
    } else {
        details.style.display = 'block';
        toggle.textContent = '▲';
        sessionItem.classList.add('expanded');
    }
}

window.toggleSessionDetails = toggleSessionDetails;
// ============================================
// LOCAL STORAGE INTEGRATION POINT
// ============================================

function saveToLocalStorage() {
    // TODO: Implement persistence
    localStorage.setItem('gymTrackerData', JSON.stringify(appState));
}

function loadFromLocalStorage() {
    // TODO: Implement data loading
    const data = localStorage.getItem('gymTrackerData');
    if (data) {
        Object.assign(appState, JSON.parse(data));
        updateDashboard();
    }
}

// ============================================
// INITIALIZATION
// ============================================
loadFromLocalStorage();
if (typeof updateDashboard === 'function') {
    updateDashboard();
}

const savedView = localStorage.getItem('currentView') || 'dashboard';
showView(savedView);

// Set date input to today by default
const dateInput = document.getElementById('session-date-input');
if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
}

document.body.classList.remove('preload');

updateDashboard();
console.log('🚀 Gym Tracker initialized');
