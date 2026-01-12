// inspiration.js
// API Ninjas - Exercises
// Endpoint: https://api.api-ninjas.com/v1/exercises

const API_KEY = 'Auv9y4hoPpmBUzAj4ekVlGuv8QVVYxqI93CR1S5y';

function buildQuery() {
    const params = new URLSearchParams();

    const name = document.getElementById('ex-name').value.trim();
    const type = document.getElementById('ex-type').value.trim();
    const muscle = document.getElementById('ex-muscle').value.trim();
    const difficulty = document.getElementById('ex-difficulty').value.trim();
    const equipment = document.getElementById('ex-equipment').value.trim();

    if (name) params.set('name', name);
    if (type) params.set('type', type);
    if (muscle) params.set('muscle', muscle);
    if (difficulty) params.set('difficulty', difficulty);
    if (equipment) params.set('equipment', equipment);

    return params.toString();
}

function setStatus(text) {
    document.getElementById('inspiration-status').textContent = text || '';
}

function openExerciseModal(ex) {
    const modal = document.getElementById('exercise-modal');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');

    title.textContent = ex?.name || 'Exercise';

    const equipments = Array.isArray(ex?.equipments)
        ? ex.equipments.join(', ')
        : ex?.equipments || '-';

    const instructions = ex?.instructions || '-';
    const safety = ex?.safety_info || ex?.safety || '-';

    body.innerHTML = `
    <div class="modal-grid">
      <div class="modal-block">
        <h4>Type</h4>
        <p>${ex?.type || '-'}</p>
      </div>
      <div class="modal-block">
        <h4>Muscle</h4>
        <p>${ex?.muscle || '-'}</p>
      </div>
      <div class="modal-block">
        <h4>Difficulty</h4>
        <p>${ex?.difficulty || '-'}</p>
      </div>
      <div class="modal-block">
        <h4>Equipment</h4>
        <p>${equipments}</p>
      </div>
      <div class="modal-block" style="grid-column: 1 / -1;">
        <h4>Instructions</h4>
        <p>${instructions}</p>
      </div>
      <div class="modal-block" style="grid-column: 1 / -1;">
        <h4>Safety info</h4>
        <p>${safety}</p>
      </div>
    </div>
  `;

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
}

function closeExerciseModal() {
    const modal = document.getElementById('exercise-modal');
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
}

function renderResults(items) {
    const list = document.getElementById('exercise-results');
    list.innerHTML = '';

    if (!Array.isArray(items) || items.length === 0) {
        list.innerHTML = `<div class="empty-state" style="padding: 1.5rem;">
      <div class="empty-state-icon">🫥</div>
      <p>No results.</p>
    </div>`;
        return;
    }

    for (const ex of items) {
        const card = document.createElement('div');
        card.className = 'exercise-card-mini';
        card.style.cursor = 'pointer';

        card.innerHTML = `
      <h4>${ex.name || 'Exercise'}</h4>
      <div class="exercise-meta">
        <div><strong>Type:</strong> ${ex.type || '-'}</div>
        <div><strong>Muscle:</strong> ${ex.muscle || '-'}</div>
        <div><strong>Difficulty:</strong> ${ex.difficulty || '-'}</div>
        <div><strong>Equipment:</strong> ${
            Array.isArray(ex.equipments)
                ? ex.equipments.join(', ')
                : ex.equipments || '-'
        }</div>

      </div>
    `;

        // ✅ klik w kafelek -> modal z detalami
        card.addEventListener('click', () => openExerciseModal(ex));

        list.appendChild(card);
    }
}

async function fetchExercises() {
    const qs = buildQuery();
    const url = `https://api.api-ninjas.com/v1/exercises${qs ? `?${qs}` : ''}`;

    setStatus('Loading...');

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'X-Api-Key': API_KEY,
            },
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`HTTP ${res.status}: ${text}`);
        }

        const data = await res.json();
        renderResults(data);
        setStatus(`Done (${Array.isArray(data) ? data.length : 0})`);
    } catch (err) {
        console.error(err);
        setStatus('Error.');

        renderResults([]);
    }
}

function clearResults() {
    document.getElementById('exercise-results').innerHTML = '';
    setStatus('');
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('exercise-form').addEventListener('submit', (e) => {
        e.preventDefault();
        fetchExercises();
    });

    document.getElementById('clear-results').addEventListener('click', () => {
        clearResults();
    });
    document
        .getElementById('modal-close')
        .addEventListener('click', closeExerciseModal);
    document
        .getElementById('modal-close-2')
        .addEventListener('click', closeExerciseModal);

    // klik w tło modala też zamyka
    document.getElementById('exercise-modal').addEventListener('click', (e) => {
        if (e.target.id === 'exercise-modal') closeExerciseModal();
    });

    // ESC zamyka
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeExerciseModal();
    });
});
