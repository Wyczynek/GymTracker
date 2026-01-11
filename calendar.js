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
    const state = window.appState;
    if (!state || !Array.isArray(state.sessions)) return [];
    return state.sessions.filter((s) => s.date === isoDate);
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
        console.log('Clicked:', iso, sessions);
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
setMode('month');
