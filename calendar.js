// calendar.js

let currentMonth = new Date().getMonth(); // 0-11
let currentYear = new Date().getFullYear();
let isAnimating = false;

// tryb widoku
let calendarMode = 'month'; // "month" | "year"

const monthNamesEN = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
];

const monthShortEN = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

function pad2(n) {
    return String(n).padStart(2, '0');
}

function toISODate(year, month0, day) {
    return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

function getSessionsForDate(isoDate) {
    // Load sessions from localStorage
    const sessionsData = localStorage.getItem('gymTrackerSessions');
    if (!sessionsData) return [];

    const sessions = JSON.parse(sessionsData);
    if (!Array.isArray(sessions)) return [];

    return sessions.filter((s) => {
        // Compare just the date part (YYYY-MM-DD)
        const sessionDate = s.date.split('T')[0];
        return sessionDate === isoDate;
    });
}
function getAllSessions() {
    const data = localStorage.getItem('gymTrackerSessions');
    try {
        const arr = data ? JSON.parse(data) : [];
        return Array.isArray(arr) ? arr : [];
    } catch {
        return [];
    }
}

function saveAllSessions(sessions) {
    localStorage.setItem('gymTrackerSessions', JSON.stringify(sessions));
}

function deleteSessionById(id) {
    const sessions = getAllSessions();
    const next = sessions.filter((s) => String(s.id) !== String(id));
    saveAllSessions(next);
}
function esc(str) {
    return String(str ?? '').replace(
        /[&<>"']/g,
        (m) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            }[m])
    );
}

function renderSessionDetailsHTML(session) {
    const exercises = Array.isArray(session.exercises) ? session.exercises : [];

    if (exercises.length === 0) {
        return `<div class="muted">No exercises recorded.</div>`;
    }

    return exercises
        .map((ex, exIndex) => {
            const sets = Array.isArray(ex.sets) ? ex.sets : [];

            const setsHtml = sets.length
                ? sets
                      .map(
                          (set, i) => `
          <div class="set-row-details">
            <div class="set-chip">Set ${i + 1}</div>
            <div class="set-fields">
              <span><b>Weight:</b> ${esc(set.weight ?? 0)} kg</span>
              <span><b>Reps:</b> ${esc(set.reps ?? 0)}</span>
              <span><b>RIR:</b> ${esc(set.rir ?? 0)}</span>
            </div>
          </div>
        `
                      )
                      .join('')
                : `<div class="muted">No sets.</div>`;

            return `
      <div class="exercise-details">
        <div class="exercise-details-title">${esc(
            ex.name || `Exercise ${exIndex + 1}`
        )}</div>
        <div class="exercise-details-sets">
          ${setsHtml}
        </div>
      </div>
    `;
        })
        .join('');
}

function openDayModal(isoDate) {
    const modal = document.getElementById('day-modal');
    const title = document.getElementById('day-modal-title');
    const content = document.getElementById('day-modal-content');

    const sessions = getSessionsForDate(isoDate);

    title.textContent = `Sessions • ${isoDate}`;
    content.innerHTML = '';

    if (!sessions.length) {
        content.innerHTML = `
      <div class="empty-state" style="padding:1.5rem;">
        <div class="empty-state-icon">📭</div>
        <p>No sessions for this day.</p>
      </div>
    `;
    } else {
        sessions.forEach((s) => {
            const item = document.createElement('div');
            item.className = 'session-item';
            const dateStr = (s.date || '').split('T')[0] || isoDate;
            const exercisesCount = Array.isArray(s.exercises)
                ? s.exercises.length
                : 0;

            item.innerHTML = `
            <div class="session-item-left">
                <div class="session-item-title">Workout Session</div>
                <div class="session-item-meta">${dateStr} • Exercises: ${exercisesCount}</div>
            </div>

            <div class="session-item-actions">
                <button class="btn btn-secondary" data-action="show">Show</button>
                <button class="btn btn-secondary" data-action="delete">Delete</button>
            </div>

            <div class="session-details" style="display:none; margin-top:12px;"></div>
            `;

            // DELETE
            item.querySelector('[data-action="delete"]').addEventListener(
                'click',
                () => {
                    deleteSessionById(s.id);
                    openDayModal(isoDate);
                    rerenderCalendarCurrentView();
                    updateDashboard();
                }
            );

            // SHOW (toggle details)
            item.querySelector('[data-action="show"]').addEventListener(
                'click',
                () => {
                    const detailsEl = item.querySelector('.session-details');
                    const btn = item.querySelector('[data-action="show"]');

                    const isOpen = detailsEl.style.display === 'block';

                    if (isOpen) {
                        detailsEl.style.display = 'none';
                        btn.textContent = 'Show';
                        return;
                    }

                    // zbuduj HTML szczegółów
                    detailsEl.innerHTML = renderSessionDetailsHTML(s);
                    detailsEl.style.display = 'block';
                    btn.textContent = 'Hide';
                }
            );

            content.appendChild(item);
        });
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeDayModal() {
    const modal = document.getElementById('day-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function initDayModalEvents() {
    const modal = document.getElementById('day-modal');
    const close1 = document.getElementById('day-modal-close');
    const close2 = document.getElementById('day-modal-close-2');

    close1.addEventListener('click', closeDayModal);
    close2.addEventListener('click', closeDayModal);

    modal.addEventListener('click', (e) => {
        if (e.target.id === 'day-modal') closeDayModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeDayModal();
    });
}

function rerenderCalendarCurrentView() {
    if (calendarMode === 'month') renderMonth(currentMonth, currentYear);
    else renderYear(currentYear);
}

// ---------- RENDER: MONTH ----------
function renderMonth(month0, year) {
    const grid = document.getElementById('calendar-grid');
    const header = document.getElementById('current-month');

    header.textContent = `${monthNamesEN[month0]} ${year}`;
    grid.innerHTML = '';

    const firstDay = new Date(year, month0, 1);
    const daysInMonth = new Date(year, month0 + 1, 0).getDate();

    // Monday-first: Mon=0 ... Sun=6
    const firstDayIndex = (firstDay.getDay() + 6) % 7;

    // prev month
    const prevMonth0 = (month0 + 11) % 12;
    const prevMonthYear = month0 === 0 ? year - 1 : year;
    const daysInPrevMonth = new Date(
        prevMonthYear,
        prevMonth0 + 1,
        0
    ).getDate();

    for (let i = 0; i < firstDayIndex; i++) {
        const day = daysInPrevMonth - firstDayIndex + 1 + i;
        grid.appendChild(
            makeDayTile({
                year: prevMonthYear,
                month0: prevMonth0,
                day,
                outside: true,
            })
        );
    }

    for (let day = 1; day <= daysInMonth; day++) {
        grid.appendChild(makeDayTile({ year, month0, day, outside: false }));
    }

    const totalTiles = firstDayIndex + daysInMonth;
    const remainder = totalTiles % 7;
    const nextFill = remainder === 0 ? 0 : 7 - remainder;

    const nextMonth0 = (month0 + 1) % 12;
    const nextMonthYear = month0 === 11 ? year + 1 : year;

    for (let day = 1; day <= nextFill; day++) {
        grid.appendChild(
            makeDayTile({
                year: nextMonthYear,
                month0: nextMonth0,
                day,
                outside: true,
            })
        );
    }
}

function makeDayTile({ year, month0, day, outside }) {
    const tile = document.createElement('div');
    tile.className = 'day-tile';
    if (outside) tile.classList.add('is-outside');

    const num = document.createElement('div');
    num.className = 'day-number';
    num.textContent = day;
    tile.appendChild(num);

    const iso = toISODate(year, month0, day);
    const sessions = getSessionsForDate(iso);

    if (sessions.length > 0) {
        tile.classList.add('has-session');
        const badge = document.createElement('div');
        badge.className = 'session-badge';
        badge.textContent = sessions.length;
        tile.appendChild(badge);
    }

    const now = new Date();
    if (
        !outside &&
        year === now.getFullYear() &&
        month0 === now.getMonth() &&
        day === now.getDate()
    ) {
        tile.classList.add('is-today');
    }

    tile.addEventListener('click', () => {
        openDayModal(iso);
    });

    return tile;
}

// ---------- RENDER: YEAR ----------
function renderYear(year) {
    const yearGrid = document.getElementById('year-grid');
    const header = document.getElementById('current-month');

    header.textContent = `${year}`; // w trybie rocznym pokazujemy sam rok
    yearGrid.innerHTML = '';

    for (let m = 0; m < 12; m++) {
        const tile = document.createElement('div');
        tile.className = 'month-tile';
        if (m === currentMonth && year === currentYear)
            tile.classList.add('is-active');

        tile.textContent = monthShortEN[m];

        tile.addEventListener('click', () => {
            // wybór miesiąca -> wracamy do widoku miesięcznego
            currentMonth = m;
            currentYear = year;
            setMode('month');
        });

        yearGrid.appendChild(tile);
    }
}

// ---------- MODE SWITCH ----------
function setMode(mode) {
    calendarMode = mode;

    const monthGrid = document.getElementById('calendar-grid');
    const yearGrid = document.getElementById('year-grid');

    if (mode === 'month') {
        yearGrid.style.display = 'none';
        monthGrid.style.display = 'grid'; // bo to grid w CSS
        renderMonth(currentMonth, currentYear);
    } else {
        monthGrid.style.display = 'none';
        yearGrid.style.display = 'grid';
        renderYear(currentYear);
    }
}

// ---------- ANIMATED NAV ----------
function changePeriodAnimated(direction) {
    if (isAnimating) return;
    isAnimating = true;

    // animujemy ten grid, który jest aktualnie widoczny
    const activeGrid =
        calendarMode === 'month'
            ? document.getElementById('calendar-grid')
            : document.getElementById('year-grid');

    const leaveClass =
        direction === -1 ? 'is-leaving-right' : 'is-leaving-left';

    activeGrid.classList.remove(
        'is-leaving-right',
        'is-leaving-left',
        'is-entering'
    );
    activeGrid.classList.add(leaveClass);

    window.setTimeout(() => {
        if (calendarMode === 'month') {
            // zmiana miesiąca
            if (direction === -1) {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
            } else {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
            }
            renderMonth(currentMonth, currentYear);
        } else {
            // zmiana roku
            currentYear += direction;
            renderYear(currentYear);
        }

        activeGrid.classList.remove('is-leaving-right', 'is-leaving-left');
        void activeGrid.offsetWidth;
        activeGrid.classList.add('is-entering');

        window.setTimeout(() => {
            isAnimating = false;
        }, 160);
    }, 160);
}

// Buttons (Prev/Next)
document.getElementById('prev-month').addEventListener('click', () => {
    changePeriodAnimated(-1);
});

document.getElementById('next-month').addEventListener('click', () => {
    changePeriodAnimated(1);
});

// Click title: Month <-> Year
document.getElementById('current-month').addEventListener('click', () => {
    setMode(calendarMode === 'month' ? 'year' : 'month');
});

// INIT
initDayModalEvents();

setMode('month');
