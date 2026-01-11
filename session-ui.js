// ============================================
// SESSION UI MANAGEMENT
// ============================================

class SessionUI {
  constructor() {
    this.container = document.getElementById('exercises-container');
    this.autocompleteList = null;
  }

  renderExercises() {
    this.container.innerHTML = '';

    if (sessionManager.exercises.length === 0) {
      this.container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🏋️</div>
          <p>No exercises added yet. Click "Add Exercise" to start!</p>
        </div>
      `;
      return;
    }

    sessionManager.exercises.forEach(exercise => {
      this.renderExerciseCard(exercise);
    });
  }

  renderExerciseCard(exercise) {
    const card = document.createElement('div');
    card.className = 'exercise-card';
    card.dataset.exerciseId = exercise.id;

    const setsHTML = exercise.sets.map((set, index) => `
      <div class="set-row" data-set-id="${set.id}">
        <span class="set-label">Set ${index + 1}</span>
        <div class="set-input-group">
          <label class="set-input-label">Weight (kg)</label>
          <input type="number" class="set-input" data-field="weight" value="${set.weight}" min="0" step="0.5">
        </div>
        <div class="set-input-group">
          <label class="set-input-label">Reps</label>
          <input type="number" class="set-input" data-field="reps" value="${set.reps}" min="0">
        </div>
        <div class="set-input-group">
          <label class="set-input-label">RIR</label>
          <input type="number" class="set-input" data-field="rir" value="${set.rir}" min="0" max="10">
        </div>
      </div>
    `).join('');

    card.innerHTML = `
      <div class="exercise-header">
        <input type="text" class="exercise-name-input" value="${exercise.name}" data-exercise-id="${exercise.id}">
        <button class="btn btn-secondary btn-icon remove-exercise-btn" data-exercise-id="${exercise.id}">×</button>
      </div>
      <div class="sets-container">
        ${setsHTML}
      </div>
      <button class="btn btn-secondary add-set-btn" data-exercise-id="${exercise.id}">+ Add Set</button>
    `;

    this.container.appendChild(card);
    this.attachExerciseCardListeners(card, exercise);
  }

  attachExerciseCardListeners(card, exercise) {
    // Exercise name input
    const nameInput = card.querySelector('.exercise-name-input');
    nameInput.addEventListener('blur', (e) => {
      const newName = e.target.value.trim();
      if (newName && newName !== exercise.name) {
        exercise.name = newName;
        exerciseManager.saveExerciseToHistory(newName);
        sessionManager.updateExercise(exercise.id, exercise);
      }
    });

    // Set inputs
    card.querySelectorAll('.set-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const setRow = e.target.closest('.set-row');
        const setId = parseInt(setRow.dataset.setId);
        const field = e.target.dataset.field;
        const value = parseFloat(e.target.value) || 0;

        const set = exercise.sets.find(s => s.id === setId);
        if (set) {
          set[field] = value;
          sessionManager.updateExercise(exercise.id, exercise);
        }
      });
    });

    // Add set button
    const addSetBtn = card.querySelector('.add-set-btn');
    addSetBtn.addEventListener('click', () => {
      const lastSet = exercise.sets[exercise.sets.length - 1];
      const newSetData = lastSet ? {
        weight: lastSet.weight,
        reps: lastSet.reps,
        rir: lastSet.rir
      } : { weight: 0, reps: 0, rir: 0 };

      exerciseManager.addSet(exercise, newSetData);
      sessionManager.updateExercise(exercise.id, exercise);
      this.renderExercises();
    });

    // Remove exercise button
    const removeBtn = card.querySelector('.remove-exercise-btn');
    removeBtn.addEventListener('click', () => {
      sessionManager.removeExercise(exercise.id);
      this.renderExercises();
    });
  }

  showAddExerciseModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>Add Exercise</h3>
          <button class="btn btn-secondary btn-icon close-modal-btn">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Exercise Name</label>
            <div class="autocomplete-container">
              <input type="text" id="exercise-name-input" class="form-input" placeholder="Enter exercise name..." autocomplete="off">
              <div class="autocomplete-list" id="autocomplete-list"></div>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary cancel-btn">Cancel</button>
          <button class="btn btn-primary add-exercise-confirm-btn">Add Exercise</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    const input = modal.querySelector('#exercise-name-input');
    const autocompleteList = modal.querySelector('#autocomplete-list');
    const addBtn = modal.querySelector('.add-exercise-confirm-btn');
    const closeBtn = modal.querySelector('.close-modal-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');

    // Autocomplete functionality
    input.addEventListener('input', (e) => {
      const value = e.target.value;
      const suggestions = exerciseManager.getExerciseSuggestions(value);

      autocompleteList.innerHTML = '';

      if (suggestions.length > 0 && value.trim() !== '') {
        suggestions.forEach(suggestion => {
          const item = document.createElement('div');
          item.className = 'autocomplete-item';
          item.textContent = suggestion;
          item.addEventListener('click', () => {
            input.value = suggestion;
            autocompleteList.innerHTML = '';
          });
          autocompleteList.appendChild(item);
        });
      }
    });

    // Close autocomplete when clicking outside
    input.addEventListener('blur', () => {
      setTimeout(() => {
        autocompleteList.innerHTML = '';
      }, 200);
    });

    // Add exercise
    const addExercise = () => {
      const exerciseName = input.value.trim();
      if (exerciseName) {
        const exercise = exerciseManager.createExercise(exerciseName);
        exerciseManager.addSet(exercise, { weight: 0, reps: 0, rir: 0 });
        sessionManager.addExercise(exercise);
        this.renderExercises();
        modal.remove();
      }
    };

    addBtn.addEventListener('click', addExercise);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        addExercise();
      }
    });

    closeBtn.addEventListener('click', () => modal.remove());
    cancelBtn.addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });

    // Focus input
    setTimeout(() => input.focus(), 100);
  }
}

// Export singleton instance
const sessionUI = new SessionUI();
