window.appState = {
    currentView: 'dashboard',
    sessions: [],
    exercises: [],
};

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

console.log('🚀 Gym Tracker initialized');
console.log('📍 Integration points marked with console logs');
