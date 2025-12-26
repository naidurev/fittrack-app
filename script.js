// ========================================
// FITTRACK PRO - COMPREHENSIVE EDITION
// All 18 Features Implemented
// ========================================

// State Management
let workoutHistory = [];
let workoutTemplates = [];
let bodyWeightLog = [];
let personalRecords = {};
let currentWorkout = {
    exercises: [],
    startTime: null,
    endTime: null,
    notes: '',
    bodyWeight: null
};
let workoutTimerInterval = null;
let restTimerInterval = null;
let restTimeRemaining = 0;
let restTimerPaused = false;
let autoStartRest = true;
let currentTheme = 'dark';

// Exercise Library with muscle groups
const EXERCISE_LIBRARY = [
    { name: 'Bench Press', muscle: 'chest' },
    { name: 'Incline Bench Press', muscle: 'chest' },
    { name: 'Dumbbell Flyes', muscle: 'chest' },
    { name: 'Push-ups', muscle: 'chest' },
    { name: 'Deadlift', muscle: 'back' },
    { name: 'Barbell Row', muscle: 'back' },
    { name: 'Pull-ups', muscle: 'back' },
    { name: 'Lat Pulldown', muscle: 'back' },
    { name: 'Cable Rows', muscle: 'back' },
    { name: 'Squat', muscle: 'legs' },
    { name: 'Leg Press', muscle: 'legs' },
    { name: 'Lunges', muscle: 'legs' },
    { name: 'Leg Curl', muscle: 'legs' },
    { name: 'Leg Extension', muscle: 'legs' },
    { name: 'Calf Raises', muscle: 'legs' },
    { name: 'Overhead Press', muscle: 'shoulders' },
    { name: 'Lateral Raises', muscle: 'shoulders' },
    { name: 'Front Raises', muscle: 'shoulders' },
    { name: 'Face Pulls', muscle: 'shoulders' },
    { name: 'Bicep Curls', muscle: 'arms' },
    { name: 'Hammer Curls', muscle: 'arms' },
    { name: 'Tricep Dips', muscle: 'arms' },
    { name: 'Tricep Extensions', muscle: 'arms' },
    { name: 'Skull Crushers', muscle: 'arms' },
    { name: 'Plank', muscle: 'core' },
    { name: 'Crunches', muscle: 'core' },
    { name: 'Russian Twists', muscle: 'core' },
    { name: 'Hanging Leg Raises', muscle: 'core' }
];

// Initialize App
window.addEventListener('load', () => {
    loadFromStorage();
    populateExerciseLibrary();
    updateHomeUI();
    setupEventListeners();
    calculateStreak();
    updateBodyWeightDisplay();
    applyTheme();
});

// ========================================
// EVENT LISTENERS SETUP
// ========================================
function setupEventListeners() {
    // Home screen
    document.getElementById('startWorkoutBtn').addEventListener('click', startWorkout);
    document.getElementById('repeatLastBtn')?.addEventListener('click', repeatLastWorkout);
    document.getElementById('templatesBtn')?.addEventListener('click', openTemplatesModal);
    document.getElementById('statsBtn')?.addEventListener('click', openStatsScreen);
    document.getElementById('logWeightBtn')?.addEventListener('click', openBodyWeightModal);
    document.getElementById('calendarViewBtn')?.addEventListener('click', openCalendarModal);
    document.getElementById('exportBtn')?.addEventListener('click', exportData);
    document.getElementById('themeToggle')?.addEventListener('click', toggleTheme);

    // Workout screen
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
    document.getElementById('autoStartRest')?.addEventListener('change', (e) => {
        autoStartRest = e.target.checked;
        saveToStorage();
    });

    // Summary modal
    document.getElementById('closeSummaryBtn').addEventListener('click', closeSummaryModal);
    document.getElementById('saveTemplateBtn')?.addEventListener('click', saveAsTemplate);
    document.getElementById('shareWorkoutBtn')?.addEventListener('click', shareWorkout);

    // Templates
    document.getElementById('closeTemplatesBtn')?.addEventListener('click', closeTemplatesModal);

    // Calendar
    document.getElementById('closeCalendarBtn')?.addEventListener('click', closeCalendarModal);

    // Body weight
    document.getElementById('saveBodyWeightBtn')?.addEventListener('click', saveBodyWeight);
    document.getElementById('cancelBodyWeightBtn')?.addEventListener('click', () => {
        document.getElementById('bodyWeightModal').style.display = 'none';
    });

    // Stats screen
    document.getElementById('closeStatsBtn')?.addEventListener('click', closeStatsScreen);

    // 1RM Calculator
    document.getElementById('calculateRMBtn')?.addEventListener('click', calculate1RM);
    document.getElementById('closeRMBtn')?.addEventListener('click', () => {
        document.getElementById('rmCalculatorModal').style.display = 'none';
    });

    // Enter key handlers
    document.getElementById('exerciseName').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmAddExercise();
    });
}

// ========================================
// THEME TOGGLE
// ========================================
function toggleTheme() {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    saveToStorage();
}

function applyTheme() {
    const btn = document.getElementById('themeToggle');
    if (currentTheme === 'light') {
        document.documentElement.style.setProperty('--bg-dark', '#f5f5f5');
        document.documentElement.style.setProperty('--bg-card', 'rgba(255, 255, 255, 0.9)');
        document.documentElement.style.setProperty('--bg-card-light', 'rgba(245, 245, 245, 0.8)');
        document.documentElement.style.setProperty('--text-primary', '#1a1a1a');
        document.documentElement.style.setProperty('--text-secondary', '#666666');
        btn.textContent = '☀️';
    } else {
        document.documentElement.style.setProperty('--bg-dark', '#0f1410');
        document.documentElement.style.setProperty('--bg-card', 'rgba(20, 30, 22, 0.6)');
        document.documentElement.style.setProperty('--bg-card-light', 'rgba(30, 40, 32, 0.4)');
        document.documentElement.style.setProperty('--text-primary', '#ffffff');
        document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
        btn.textContent = '🌙';
    }
}

// ========================================
// EXERCISE LIBRARY
// ========================================
function populateExerciseLibrary() {
    const datalist = document.getElementById('exerciseLibrary');
    datalist.innerHTML = EXERCISE_LIBRARY.map(ex =>
        `<option value="${ex.name}">${ex.name} (${ex.muscle})</option>`
    ).join('');
}

// ========================================
// WORKOUT MANAGEMENT
// ========================================
function startWorkout() {
    currentWorkout = {
        exercises: [],
        startTime: Date.now(),
        endTime: null,
        notes: '',
        bodyWeight: bodyWeightLog.length > 0 ? bodyWeightLog[bodyWeightLog.length - 1].weight : null
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

function repeatLastWorkout() {
    if (workoutHistory.length === 0) {
        alert('No previous workouts to repeat');
        return;
    }

    const lastWorkout = workoutHistory[0];
    currentWorkout = {
        exercises: JSON.parse(JSON.stringify(lastWorkout.exercises)),
        startTime: Date.now(),
        endTime: null,
        notes: '',
        bodyWeight: bodyWeightLog.length > 0 ? bodyWeightLog[bodyWeightLog.length - 1].weight : null
    };

    // Clear set values but keep structure
    currentWorkout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            set.weight = 0;
            set.reps = 0;
        });
    });

    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('workoutScreen').style.display = 'block';
    document.getElementById('restTimerBtn').style.display = 'flex';

    startWorkoutTimer();
    updateCurrentExercisesUI();
}

// ========================================
// EXERCISE MANAGEMENT
// ========================================
function openAddExerciseModal() {
    document.getElementById('addExerciseModal').style.display = 'flex';
    document.getElementById('exerciseName').value = '';
    document.getElementById('muscleGroup').value = '';
    document.getElementById('exerciseNotes').value = '';
    document.getElementById('supersetCheck').checked = false;
    document.getElementById('exerciseName').focus();
}

function closeAddExerciseModal() {
    document.getElementById('addExerciseModal').style.display = 'none';
}

function confirmAddExercise() {
    const name = document.getElementById('exerciseName').value.trim();
    const muscle = document.getElementById('muscleGroup').value;
    const notes = document.getElementById('exerciseNotes').value.trim();
    const isSuperset = document.getElementById('supersetCheck').checked;

    if (!name) {
        alert('Please enter an exercise name');
        return;
    }

    // Auto-fill muscle group from library
    let muscleGroup = muscle;
    if (!muscleGroup) {
        const found = EXERCISE_LIBRARY.find(ex => ex.name.toLowerCase() === name.toLowerCase());
        if (found) muscleGroup = found.muscle;
    }

    const exercise = {
        id: Date.now(),
        name: name,
        muscleGroup: muscleGroup,
        notes: notes,
        isSuperset: isSuperset,
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
        reps: 0,
        completedAt: null
    };

    exercise.sets.push(set);
    updateCurrentExercisesUI();

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

    // Mark as completed and check for PR
    if (set.weight > 0 && set.reps > 0 && !set.completedAt) {
        set.completedAt = Date.now();
        checkPersonalRecord(exercise.name, set.weight, set.reps);

        // Auto-start rest timer if enabled
        if (autoStartRest) {
            setTimeout(() => {
                openRestTimerModal();
                startRestTimer();
            }, 500);
        }
    }

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
        <section class="card exercise-card ${exercise.isSuperset ? 'superset' : ''}">
            <div class="exercise-header">
                <div>
                    <h3>${exercise.name} ${exercise.isSuperset ? '🔗' : ''}</h3>
                    ${exercise.muscleGroup ? `<span class="muscle-badge">${exercise.muscleGroup}</span>` : ''}
                    ${exercise.notes ? `<p class="exercise-note">${exercise.notes}</p>` : ''}
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button class="icon-btn" onclick="open1RMCalculator('${exercise.name}')" title="1RM Calculator">🧮</button>
                    <button class="delete-btn" onclick="deleteExercise(${exercise.id})">Delete</button>
                </div>
            </div>

            <div class="sets-container">
                ${exercise.sets.map((set, index) => {
                    const pr = getPRForExercise(exercise.name);
                    const isPR = pr && set.weight > 0 && set.reps > 0 &&
                                 (set.weight > pr.weight || (set.weight === pr.weight && set.reps > pr.reps));
                    return `
                    <div class="set-row ${isPR ? 'pr-highlight' : ''}">
                        <span class="set-number">Set ${index + 1}${isPR ? ' 🏆' : ''}</span>
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
                `}).join('')}
            </div>

            <button class="btn-add-set" onclick="addSet(${exercise.id})">+ Add Set</button>
        </section>
    `).join('');

    saveToStorage();
}

// ========================================
// PERSONAL RECORDS
// ========================================
function checkPersonalRecord(exerciseName, weight, reps) {
    const key = exerciseName.toLowerCase();
    const current = personalRecords[key];

    if (!current || weight > current.weight || (weight === current.weight && reps > current.reps)) {
        personalRecords[key] = {
            exercise: exerciseName,
            weight: weight,
            reps: reps,
            date: new Date().toISOString()
        };
        saveToStorage();

        // Show notification
        if (current) {
            showNotification(`🏆 New PR! ${exerciseName}: ${weight}lbs × ${reps} reps`);
        }
    }
}

function getPRForExercise(exerciseName) {
    return personalRecords[exerciseName.toLowerCase()];
}

function showNotification(message) {
    // Simple alert for now - could be enhanced with toast notifications
    setTimeout(() => alert(message), 100);
}

// ========================================
// REST TIMER
// ========================================
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

    if (restTimerInterval) clearInterval(restTimerInterval);

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
    if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200, 100, 200]);
    }

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

// ========================================
// FINISH WORKOUT
// ========================================
function finishWorkout() {
    if (currentWorkout.exercises.length === 0) {
        alert('Add at least one exercise before finishing');
        return;
    }

    if (workoutTimerInterval) clearInterval(workoutTimerInterval);
    if (restTimerInterval) clearInterval(restTimerInterval);

    currentWorkout.endTime = Date.now();
    currentWorkout.notes = document.getElementById('workoutNotes').value;

    const duration = currentWorkout.endTime - currentWorkout.startTime;
    const totalExercises = currentWorkout.exercises.length;
    let totalSets = 0;
    let totalVolume = 0;
    const newPRs = [];

    currentWorkout.exercises.forEach(exercise => {
        exercise.sets.forEach(set => {
            totalSets++;
            totalVolume += (set.weight * set.reps);

            // Check for PRs again
            const pr = getPRForExercise(exercise.name);
            if (pr && set.weight === pr.weight && set.reps === pr.reps &&
                pr.date === new Date().toISOString().split('T')[0]) {
                newPRs.push(`${exercise.name}: ${set.weight}lbs × ${set.reps}`);
            }
        });
    });

    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        duration: duration,
        exercises: JSON.parse(JSON.stringify(currentWorkout.exercises)),
        totalExercises: totalExercises,
        totalSets: totalSets,
        totalVolume: totalVolume,
        notes: currentWorkout.notes,
        bodyWeight: currentWorkout.bodyWeight
    };

    workoutHistory.unshift(session);
    if (workoutHistory.length > 100) {
        workoutHistory = workoutHistory.slice(0, 100);
    }

    saveToStorage();
    showSummary(duration, totalExercises, totalSets, totalVolume, newPRs);
}

function showSummary(duration, exercises, sets, volume, prs) {
    document.getElementById('summaryDuration').textContent = formatTime(duration);
    document.getElementById('summaryExercises').textContent = exercises;
    document.getElementById('summarySets').textContent = sets;
    document.getElementById('summaryVolume').textContent = volume.toLocaleString() + ' lbs';

    const prDiv = document.getElementById('prAchievements');
    if (prs.length > 0) {
        prDiv.innerHTML = `
            <div class="pr-achievements">
                <h3>🏆 New Personal Records!</h3>
                ${prs.map(pr => `<p>✨ ${pr}</p>`).join('')}
            </div>
        `;
    } else {
        prDiv.innerHTML = '';
    }

    document.getElementById('summaryModal').style.display = 'flex';
}

function closeSummaryModal() {
    document.getElementById('summaryModal').style.display = 'none';

    document.getElementById('workoutScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
    document.getElementById('restTimerBtn').style.display = 'none';

    currentWorkout = {
        exercises: [],
        startTime: null,
        endTime: null,
        notes: '',
        bodyWeight: null
    };

    document.getElementById('currentExercises').innerHTML = '';
    document.getElementById('workoutTimer').textContent = '00:00:00';
    document.getElementById('workoutNotes').value = '';

    updateHomeUI();
    saveToStorage();
}

// ========================================
// TEMPLATES
// ========================================
function saveAsTemplate() {
    const name = prompt('Enter template name:');
    if (!name) return;

    const template = {
        id: Date.now(),
        name: name,
        exercises: JSON.parse(JSON.stringify(currentWorkout.exercises))
    };

    workoutTemplates.push(template);
    saveToStorage();
    alert('Template saved!');
}

function openTemplatesModal() {
    const container = document.getElementById('templatesList');

    if (workoutTemplates.length === 0) {
        container.innerHTML = '<p class="empty-state">No templates saved yet.</p>';
    } else {
        container.innerHTML = workoutTemplates.map(template => `
            <div class="template-item">
                <div>
                    <strong>${template.name}</strong>
                    <p>${template.exercises.length} exercises</p>
                </div>
                <div>
                    <button class="btn-secondary" onclick="loadTemplate(${template.id})">Load</button>
                    <button class="delete-btn" onclick="deleteTemplate(${template.id})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    document.getElementById('templatesModal').style.display = 'flex';
}

function closeTemplatesModal() {
    document.getElementById('templatesModal').style.display = 'none';
}

function loadTemplate(templateId) {
    const template = workoutTemplates.find(t => t.id === templateId);
    if (!template) return;

    currentWorkout = {
        exercises: JSON.parse(JSON.stringify(template.exercises)),
        startTime: Date.now(),
        endTime: null,
        notes: '',
        bodyWeight: bodyWeightLog.length > 0 ? bodyWeightLog[bodyWeightLog.length - 1].weight : null
    };

    currentWorkout.exercises.forEach(ex => {
        ex.sets.forEach(set => {
            set.weight = 0;
            set.reps = 0;
            set.completedAt = null;
        });
    });

    closeTemplatesModal();
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('workoutScreen').style.display = 'block';
    document.getElementById('restTimerBtn').style.display = 'flex';

    startWorkoutTimer();
    updateCurrentExercisesUI();
}

function deleteTemplate(templateId) {
    if (confirm('Delete this template?')) {
        workoutTemplates = workoutTemplates.filter(t => t.id !== templateId);
        saveToStorage();
        openTemplatesModal();
    }
}

// ========================================
// BODY WEIGHT TRACKING
// ========================================
function openBodyWeightModal() {
    document.getElementById('bodyWeightModal').style.display = 'flex';
    const lastWeight = bodyWeightLog.length > 0 ? bodyWeightLog[bodyWeightLog.length - 1].weight : '';
    document.getElementById('bodyWeightInput').value = lastWeight;
}

function saveBodyWeight() {
    const weight = parseFloat(document.getElementById('bodyWeightInput').value);
    if (!weight || weight <= 0) {
        alert('Please enter a valid weight');
        return;
    }

    bodyWeightLog.push({
        date: new Date().toISOString(),
        weight: weight
    });

    saveToStorage();
    updateBodyWeightDisplay();
    document.getElementById('bodyWeightModal').style.display = 'none';
}

function updateBodyWeightDisplay() {
    const display = document.getElementById('bodyWeightDisplay');
    if (bodyWeightLog.length > 0) {
        const latest = bodyWeightLog[bodyWeightLog.length - 1];
        display.textContent = latest.weight + ' lbs';
    } else {
        display.textContent = '--';
    }
}

// ========================================
// STREAKS
// ========================================
function calculateStreak() {
    if (workoutHistory.length === 0) {
        document.getElementById('streakCount').textContent = '0';
        return;
    }

    let streak = 0;
    const today = new Date().setHours(0, 0, 0, 0);
    const oneDayMs = 24 * 60 * 60 * 1000;

    const sortedHistory = [...workoutHistory].sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    const uniqueDates = [...new Set(sortedHistory.map(w =>
        new Date(w.date).setHours(0, 0, 0, 0)
    ))];

    let expectedDate = today;
    for (let date of uniqueDates) {
        if (date === expectedDate || date === expectedDate - oneDayMs) {
            streak++;
            expectedDate = date - oneDayMs;
        } else {
            break;
        }
    }

    document.getElementById('streakCount').textContent = streak;
}

// ========================================
// 1RM CALCULATOR
// ========================================
function open1RMCalculator(exerciseName) {
    document.getElementById('rmCalculatorModal').style.display = 'flex';
    document.getElementById('rmWeight').value = '';
    document.getElementById('rmReps').value = '';
    document.getElementById('rmResult').innerHTML = '';
}

function calculate1RM() {
    const weight = parseFloat(document.getElementById('rmWeight').value);
    const reps = parseInt(document.getElementById('rmReps').value);

    if (!weight || !reps || weight <= 0 || reps <= 0) {
        alert('Please enter valid weight and reps');
        return;
    }

    // Epley formula: 1RM = weight × (1 + reps/30)
    const oneRM = weight * (1 + reps / 30);

    document.getElementById('rmResult').innerHTML = `
        <div class="rm-result">
            <h3>Estimated 1RM: ${oneRM.toFixed(1)} lbs</h3>
            <p><strong>Training Percentages:</strong></p>
            <ul>
                <li>90%: ${(oneRM * 0.9).toFixed(1)} lbs</li>
                <li>85%: ${(oneRM * 0.85).toFixed(1)} lbs</li>
                <li>80%: ${(oneRM * 0.8).toFixed(1)} lbs</li>
                <li>75%: ${(oneRM * 0.75).toFixed(1)} lbs</li>
                <li>70%: ${(oneRM * 0.7).toFixed(1)} lbs</li>
            </ul>
        </div>
    `;
}

// ========================================
// STATS & CHARTS
// ========================================
function openStatsScreen() {
    document.getElementById('homeScreen').style.display = 'none';
    document.getElementById('statsScreen').style.display = 'block';

    renderPRList();
    renderMuscleGroupChart();
    renderFrequencyChart();
}

function closeStatsScreen() {
    document.getElementById('statsScreen').style.display = 'none';
    document.getElementById('homeScreen').style.display = 'block';
}

function renderPRList() {
    const container = document.getElementById('prList');
    const prs = Object.values(personalRecords);

    if (prs.length === 0) {
        container.innerHTML = '<p class="empty-state">No personal records yet. Keep lifting!</p>';
        return;
    }

    container.innerHTML = prs.map(pr => `
        <div class="pr-item">
            <div>
                <strong>${pr.exercise}</strong>
                <p>${pr.weight} lbs × ${pr.reps} reps</p>
            </div>
            <span class="pr-date">${new Date(pr.date).toLocaleDateString()}</span>
        </div>
    `).join('');
}

function renderMuscleGroupChart() {
    const container = document.getElementById('muscleGroupChart');
    const muscleVolumes = {};

    workoutHistory.slice(0, 30).forEach(session => {
        session.exercises.forEach(ex => {
            const muscle = ex.muscleGroup || 'other';
            if (!muscleVolumes[muscle]) muscleVolumes[muscle] = 0;

            ex.sets.forEach(set => {
                muscleVolumes[muscle] += set.weight * set.reps;
            });
        });
    });

    const total = Object.values(muscleVolumes).reduce((a, b) => a + b, 0);

    if (total === 0) {
        container.innerHTML = '<p class="empty-state">No data yet</p>';
        return;
    }

    container.innerHTML = Object.entries(muscleVolumes)
        .sort((a, b) => b[1] - a[1])
        .map(([muscle, volume]) => {
            const percentage = (volume / total * 100).toFixed(1);
            return `
                <div class="muscle-bar">
                    <div class="muscle-label">${muscle}</div>
                    <div class="muscle-progress">
                        <div class="muscle-fill" style="width: ${percentage}%"></div>
                    </div>
                    <div class="muscle-value">${volume.toLocaleString()} lbs</div>
                </div>
            `;
        }).join('');
}

function renderFrequencyChart() {
    const canvas = document.getElementById('frequencyChart');
    const ctx = canvas.getContext('2d');

    // Simple bar chart for last 7 days
    const days = 7;
    const data = new Array(days).fill(0);
    const today = new Date().setHours(0, 0, 0, 0);

    workoutHistory.forEach(session => {
        const sessionDate = new Date(session.date).setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((today - sessionDate) / (24 * 60 * 60 * 1000));
        if (daysDiff >= 0 && daysDiff < days) {
            data[days - 1 - daysDiff]++;
        }
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / days - 10;
    const maxHeight = Math.max(...data, 1);

    data.forEach((count, i) => {
        const barHeight = (count / maxHeight) * (canvas.height - 40);
        const x = i * (barWidth + 10);
        const y = canvas.height - barHeight - 20;

        ctx.fillStyle = '#84cc16';
        ctx.fillRect(x, y, barWidth, barHeight);

        ctx.fillStyle = '#ffffff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
    });
}

// ========================================
// CALENDAR VIEW
// ========================================
function openCalendarModal() {
    document.getElementById('calendarModal').style.display = 'flex';
    renderCalendar();
}

function closeCalendarModal() {
    document.getElementById('calendarModal').style.display = 'none';
}

function renderCalendar() {
    const container = document.getElementById('calendarView');
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const workoutDates = new Set(
        workoutHistory.map(w => new Date(w.date).toDateString())
    );

    let html = `<div class="calendar-header">${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>`;
    html += '<div class="calendar-grid">';
    html += '<div class="calendar-day-header">Sun</div><div class="calendar-day-header">Mon</div><div class="calendar-day-header">Tue</div><div class="calendar-day-header">Wed</div><div class="calendar-day-header">Thu</div><div class="calendar-day-header">Fri</div><div class="calendar-day-header">Sat</div>';

    for (let i = 0; i < firstDay; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const hasWorkout = workoutDates.has(date.toDateString());
        const isToday = date.toDateString() === new Date().toDateString();

        html += `<div class="calendar-day ${hasWorkout ? 'has-workout' : ''} ${isToday ? 'today' : ''}">${day}</div>`;
    }

    html += '</div>';
    container.innerHTML = html;
}

// ========================================
// EXPORT DATA
// ========================================
function exportData() {
    const format = prompt('Export as (JSON/CSV):', 'JSON')?.toUpperCase();

    if (format === 'JSON') {
        const data = {
            workoutHistory,
            personalRecords,
            bodyWeightLog,
            workoutTemplates,
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadFile(blob, 'fittrack-data.json');
    } else if (format === 'CSV') {
        let csv = 'Date,Exercise,Sets,Reps,Weight,Volume,Notes\n';

        workoutHistory.forEach(session => {
            const date = new Date(session.date).toLocaleDateString();
            session.exercises.forEach(ex => {
                ex.sets.forEach(set => {
                    csv += `${date},${ex.name},1,${set.reps},${set.weight},${set.weight * set.reps},${ex.notes || ''}\n`;
                });
            });
        });

        const blob = new Blob([csv], { type: 'text/csv' });
        downloadFile(blob, 'fittrack-data.csv');
    }
}

function downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ========================================
// SHARE WORKOUT
// ========================================
function shareWorkout() {
    const lastWorkout = workoutHistory[0];
    if (!lastWorkout) return;

    const text = `
💪 Workout Complete!

📅 ${new Date(lastWorkout.date).toLocaleDateString()}
⏱️ Duration: ${formatTime(lastWorkout.duration)}
🏋️ ${lastWorkout.totalExercises} exercises | ${lastWorkout.totalSets} sets
📊 Total Volume: ${lastWorkout.totalVolume.toLocaleString()} lbs

Exercises:
${lastWorkout.exercises.map(ex => `• ${ex.name}: ${ex.sets.length} sets`).join('\n')}

#FitTrack #Workout #Fitness
    `.trim();

    if (navigator.share) {
        navigator.share({
            title: 'My Workout',
            text: text
        });
    } else {
        navigator.clipboard.writeText(text);
        alert('Workout summary copied to clipboard!');
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================
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

// ========================================
// HISTORY UI
// ========================================
function updateHomeUI() {
    updateHistoryUI();
    calculateStreak();

    if (workoutHistory.length > 0) {
        document.getElementById('quickActionsCard').style.display = 'block';
    }
}

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
            <div class="history-item" onclick="viewWorkoutDetails(${session.id})">
                <div class="history-header">
                    <span class="history-date">${dateStr} at ${timeStr}</span>
                    <span class="history-duration">${formatTime(session.duration)}</span>
                </div>
                <div class="history-stats">
                    ${session.totalExercises} exercises | ${session.totalSets} sets | ${session.totalVolume.toLocaleString()} lbs
                </div>
                <div class="history-exercises">${exercises}</div>
                ${session.notes ? `<div class="history-notes">📝 ${session.notes}</div>` : ''}
            </div>
        `;
    }).join('');
}

function viewWorkoutDetails(sessionId) {
    // Could implement detailed view modal
    alert('Detailed view coming soon!');
}

// ========================================
// STORAGE
// ========================================
function saveToStorage() {
    try {
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
        localStorage.setItem('currentWorkout', JSON.stringify(currentWorkout));
        localStorage.setItem('personalRecords', JSON.stringify(personalRecords));
        localStorage.setItem('bodyWeightLog', JSON.stringify(bodyWeightLog));
        localStorage.setItem('workoutTemplates', JSON.stringify(workoutTemplates));
        localStorage.setItem('autoStartRest', JSON.stringify(autoStartRest));
        localStorage.setItem('currentTheme', currentTheme);
    } catch (e) {
        console.error('Failed to save to storage', e);
    }
}

function loadFromStorage() {
    try {
        const history = localStorage.getItem('workoutHistory');
        const current = localStorage.getItem('currentWorkout');
        const prs = localStorage.getItem('personalRecords');
        const weights = localStorage.getItem('bodyWeightLog');
        const templates = localStorage.getItem('workoutTemplates');
        const autoRest = localStorage.getItem('autoStartRest');
        const theme = localStorage.getItem('currentTheme');

        if (history) workoutHistory = JSON.parse(history);
        if (prs) personalRecords = JSON.parse(prs);
        if (weights) bodyWeightLog = JSON.parse(weights);
        if (templates) workoutTemplates = JSON.parse(templates);
        if (autoRest !== null) {
            autoStartRest = JSON.parse(autoRest);
            const checkbox = document.getElementById('autoStartRest');
            if (checkbox) checkbox.checked = autoStartRest;
        }
        if (theme) currentTheme = theme;

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
