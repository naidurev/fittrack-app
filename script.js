// State management
let workoutHistory = [];
let currentWorkout = {
    exercises: [],
    startTime: null,
    endTime: null
};
let workoutTimerInterval = null;
let restTimerInterval = null;
let restTimeRemaining = 0;
let restTimerPaused = false;

// Initialize app
window.addEventListener('load', () => {
    loadFromStorage();
    updateHistoryUI();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    document.getElementById('startWorkoutBtn').addEventListener('click', startWorkout);
    document.getElementById('addExerciseBtn').addEventListener('click', openAddExerciseModal);
    document.getElementById('confirmExerciseBtn').addEventListener('click', confirmAddExercise);
    document.getElementById('cancelExerciseBtn').addEventListener('click', closeAddExerciseModal);
    document.getElementById('finishWorkoutBtn').addEventListener('click', finishWorkout);

    // Rest timer
    document.getElementById('restTimerBtn').addEventListener('click', openRestTimerModal);
    document.getElementById('startRestBtn').addEventListener('click', startRestTimer);
    document.getElementById('pauseRestBtn').addEventListener('click', pauseRestTimer);
    document.getElementById('resumeRestBtn').addEventListener('click', resumeRestTimer);
    document.getElementById('stopRestBtn').addEventListener('click', stopRestTimer);
    document.getElementById('closeRestTimerBtn').addEventListener('click', closeRestTimerModal);

    // Summary
    document.getElementById('closeSummaryBtn').addEventListener('click', closeSummaryModal);

    // Enter key on exercise name
    document.getElementById('exerciseName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            confirmAddExercise();
        }
    });
}

// Workout Timer
function startWorkout() {
    currentWorkout = {
        exercises: [],
        startTime: Date.now(),
        endTime: null
    };

    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('workoutScreen').style.display = 'block';
    document.getElementById('restTimerBtn').style.display = 'flex';

    startWorkoutTimer();
}

function startWorkoutTimer() {
    workoutTimerInterval = setInterval(() => {
        const elapsed = Date.now() - currentWorkout.startTime;
        document.getElementById('workoutTimer').textContent = formatTime(elapsed);
    }, 1000);
}

function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function formatTimeSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Exercise Management
function openAddExerciseModal() {
    document.getElementById('addExerciseModal').style.display = 'flex';
    document.getElementById('exerciseName').value = '';
    document.getElementById('exerciseName').focus();
}

function closeAddExerciseModal() {
    document.getElementById('addExerciseModal').style.display = 'none';
}

function confirmAddExercise() {
    const name = document.getElementById('exerciseName').value.trim();

    if (!name) {
        alert('Please enter an exercise name');
        return;
    }

    const exercise = {
        id: Date.now(),
        name: name,
        sets: []
    };

    currentWorkout.exercises.push(exercise);
    closeAddExerciseModal();
    updateCurrentExercisesUI();
}

function addSet(exerciseId) {
    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const set = {
        id: Date.now(),
        weight: 0,
        reps: 0
    };

    exercise.sets.push(set);
    updateCurrentExercisesUI();

    // Focus on weight input of new set
    setTimeout(() => {
        const weightInput = document.querySelector(`input[data-set-id="${set.id}"][data-field="weight"]`);
        if (weightInput) weightInput.focus();
    }, 100);
}

function updateSetValue(exerciseId, setId, field, value) {
    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.id === setId);
    if (!set) return;

    set[field] = parseFloat(value) || 0;
    saveToStorage();
}

function deleteSet(exerciseId, setId) {
    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    exercise.sets = exercise.sets.filter(s => s.id !== setId);
    updateCurrentExercisesUI();
}

function deleteExercise(exerciseId) {
    if (confirm('Delete this exercise?')) {
        currentWorkout.exercises = currentWorkout.exercises.filter(ex => ex.id !== exerciseId);
        updateCurrentExercisesUI();
    }
}

function updateCurrentExercisesUI() {
    const container = document.getElementById('currentExercises');

    if (currentWorkout.exercises.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = currentWorkout.exercises.map(exercise => `
        <section class="card exercise-card">
            <div class="exercise-header">
                <h3>${exercise.name}</h3>
                <button class="delete-btn" onclick="deleteExercise(${exercise.id})">Delete</button>
            </div>

            <div class="sets-container">
                ${exercise.sets.map((set, index) => `
                    <div class="set-row">
                        <span class="set-number">Set ${index + 1}</span>
                        <div class="set-inputs">
                            <div class="input-group-inline">
                                <label>Weight</label>
                                <input type="number"
                                    value="${set.weight || ''}"
                                    placeholder="0"
                                    data-set-id="${set.id}"
                                    data-field="weight"
                                    onchange="updateSetValue(${exercise.id}, ${set.id}, 'weight', this.value)">
                            </div>
                            <div class="input-group-inline">
                                <label>Reps</label>
                                <input type="number"
                                    value="${set.reps || ''}"
                                    placeholder="0"
                                    data-set-id="${set.id}"
                                    data-field="reps"
                                    onchange="updateSetValue(${exercise.id}, ${set.id}, 'reps', this.value)">
                            </div>
                            <button class="delete-set-btn" onclick="deleteSet(${exercise.id}, ${set.id})">×</button>
                        </div>
                    </div>
                `).join('')}
            </div>

            <button class="btn-add-set" onclick="addSet(${exercise.id})">+ Add Set</button>
        </section>
    `).join('');

    saveToStorage();
}

// Rest Timer
function openRestTimerModal() {
    document.getElementById('restTimerModal').style.display = 'flex';
}

function closeRestTimerModal() {
    document.getElementById('restTimerModal').style.display = 'none';
}

function startRestTimer() {
    const restTime = parseInt(document.getElementById('restTimeInput').value) || 90;
    restTimeRemaining = restTime;
    restTimerPaused = false;

    document.getElementById('startRestBtn').style.display = 'none';
    document.getElementById('pauseRestBtn').style.display = 'inline-block';
    document.getElementById('resumeRestBtn').style.display = 'none';

    updateRestTimerDisplay();

    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    restTimerInterval = setInterval(() => {
        if (!restTimerPaused) {
            restTimeRemaining--;
            updateRestTimerDisplay();

            if (restTimeRemaining <= 0) {
                clearInterval(restTimerInterval);
                restTimerComplete();
            }
        }
    }, 1000);
}

function pauseRestTimer() {
    restTimerPaused = true;
    document.getElementById('pauseRestBtn').style.display = 'none';
    document.getElementById('resumeRestBtn').style.display = 'inline-block';
}

function resumeRestTimer() {
    restTimerPaused = false;
    document.getElementById('pauseRestBtn').style.display = 'inline-block';
    document.getElementById('resumeRestBtn').style.display = 'none';
}

function stopRestTimer() {
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
        restTimerInterval = null;
    }

    restTimeRemaining = 0;
    document.getElementById('startRestBtn').style.display = 'inline-block';
    document.getElementById('pauseRestBtn').style.display = 'none';
    document.getElementById('resumeRestBtn').style.display = 'none';
    updateRestTimerDisplay();
}

function updateRestTimerDisplay() {
    const display = formatTimeSeconds(restTimeRemaining);
    document.getElementById('restTimerValue').textContent = display;
    document.querySelector('.rest-timer-display').textContent = display;
}

function restTimerComplete() {
    // Vibrate if supported
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

    // Play sound if possible
    try {
        const context = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.frequency.value = 800;
        oscillator.type = 'sine';

        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }

    alert('Rest time complete!');
    stopRestTimer();
}

// Finish Workout
function finishWorkout() {
    if (currentWorkout.exercises.length === 0) {
        alert('Add at least one exercise before finishing');
        return;
    }

    // Stop timers
    if (workoutTimerInterval) {
        clearInterval(workoutTimerInterval);
    }
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
    }

    currentWorkout.endTime = Date.now();

    // Calculate statistics
    const duration = currentWorkout.endTime - currentWorkout.startTime;
    const totalExercises = currentWorkout.exercises.length;
    let totalSets = 0;
    let totalVolume = 0;

    currentWorkout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            totalSets++;
            totalVolume += (set.weight * set.reps);
        });
    });

    // Save to history
    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: duration,
        exercises: JSON.parse(JSON.stringify(currentWorkout.exercises)),
        totalExercises: totalExercises,
        totalSets: totalSets,
        totalVolume: totalVolume
    };

    workoutHistory.unshift(session);

    if (workoutHistory.length > 50) {
        workoutHistory = workoutHistory.slice(0, 50);
    }

    saveToStorage();

    // Show summary
    showSummary(duration, totalExercises, totalSets, totalVolume);
}

function showSummary(duration, exercises, sets, volume) {
    document.getElementById('summaryDuration').textContent = formatTime(duration);
    document.getElementById('summaryExercises').textContent = exercises;
    document.getElementById('summarySets').textContent = sets;
    document.getElementById('summaryVolume').textContent = volume.toLocaleString();

    document.getElementById('summaryModal').style.display = 'flex';
}

function closeSummaryModal() {
    document.getElementById('summaryModal').style.display = 'none';

    // Reset workout screen
    document.getElementById('workoutScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    document.getElementById('restTimerBtn').style.display = 'none';

    currentWorkout = {
        exercises: [],
        startTime: null,
        endTime: null
    };

    document.getElementById('currentExercises').innerHTML = '';
    document.getElementById('workoutTimer').textContent = '00:00:00';

    updateHistoryUI();
    saveToStorage();
}

// History
function updateHistoryUI() {
    const container = document.getElementById('historyList');

    if (workoutHistory.length === 0) {
        container.innerHTML = '<p class="empty-state">No workout history yet.</p>';
        return;
    }

    container.innerHTML = workoutHistory.slice(0, 10).map(session => {
        const date = new Date(session.date);
        const dateStr = date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        const timeStr = date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const exercises = session.exercises
            .map(e => `${e.name} (${e.sets.length} sets)`)
            .join(', ');

        return `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-date">${dateStr} at ${timeStr}</span>
                    <span class="history-duration">${formatTime(session.duration)}</span>
                </div>
                <div class="history-stats">
                    ${session.totalExercises} exercises | ${session.totalSets} sets | ${session.totalVolume.toLocaleString()} lbs
                </div>
                <div class="history-exercises">${exercises}</div>
            </div>
        `;
    }).join('');
}

// Storage
function saveToStorage() {
    try {
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout));
    } catch (e) {
        console.error('Failed to save to storage', e);
    }
}

function loadFromStorage() {
    try {
        const history = localStorage.getItem('workoutHistory');
        const current = localStorage.getItem('currentWorkout');

        if (history) workoutHistory = JSON.parse(history);
        if (current) {
            const loaded = JSON.parse(current);
            if (loaded.startTime && !loaded.endTime) {
                currentWorkout = loaded;
            }
        }
    } catch (e) {
        console.error('Failed to load from storage', e);
    }
}
