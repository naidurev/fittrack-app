let todayWorkouts = [];
let workoutHistory = [];

window.addEventListener('load', () => {
    loadFromStorage();
    updateUI();
    setupInstallPrompt();
});

function logWorkout() {
    const exercise = document.getElementById('exerciseName').value.trim();
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const reps = parseInt(document.getElementById('reps').value) || 0;
    const sets = parseInt(document.getElementById('sets').value) || 1;
    
    if (!exercise) {
        alert('Please enter an exercise name');
        return;
    }
    
    if (reps === 0) {
        alert('Please enter number of reps');
        return;
    }
    
    const workout = {
        id: Date.now(),
        exercise: exercise,
        weight: weight,
        reps: reps,
        sets: sets,
        volume: weight * reps * sets,
        timestamp: new Date().toISOString()
    };
    
    todayWorkouts.push(workout);
    saveToStorage();
    updateUI();
    
    document.getElementById('exerciseName').value = '';
    document.getElementById('weight').value = '';
    document.getElementById('reps').value = '';
    document.getElementById('sets').value = '';
    document.getElementById('exerciseName').focus();
}

function updateUI() {
    updateTodayWorkout();
    updateHistory();
}

function updateTodayWorkout() {
    const container = document.getElementById('todayWorkout');
    const statsContainer = document.getElementById('workoutStats');
    const finishBtn = document.getElementById('finishBtn');
    
    if (todayWorkouts.length === 0) {
        container.innerHTML = '<p class="empty-state">No exercises logged yet. Start your workout!</p>';
        statsContainer.style.display = 'none';
        finishBtn.style.display = 'none';
        return;
    }
    
    statsContainer.style.display = 'grid';
    finishBtn.style.display = 'block';
    
    const totalSets = todayWorkouts.reduce((sum, w) => sum + w.sets, 0);
    const totalVolume = todayWorkouts.reduce((sum, w) => sum + w.volume, 0);
    
    document.getElementById('totalSets').textContent = totalSets;
    document.getElementById('totalVolume').textContent = totalVolume.toLocaleString();
    
    container.innerHTML = todayWorkouts.map(workout => `
        <div class="workout-item">
            <div class="workout-item-header">
                <span class="exercise-name">${workout.exercise}</span>
                <button class="delete-btn" onclick="deleteWorkout(${workout.id})">Delete</button>
            </div>
            <div class="workout-details">
                <span>${workout.sets} sets</span>
                <span>${workout.reps} reps</span>
                <span>${workout.weight} lbs</span>
                <span>Volume: ${workout.volume.toLocaleString()} lbs</span>
            </div>
        </div>
    `).join('');
}

function deleteWorkout(id) {
    if (confirm('Delete this exercise?')) {
        todayWorkouts = todayWorkouts.filter(w => w.id !== id);
        saveToStorage();
        updateUI();
    }
}

function finishWorkout() {
    if (todayWorkouts.length === 0) return;
    
    const totalSets = todayWorkouts.reduce((sum, w) => sum + w.sets, 0);
    const totalVolume = todayWorkouts.reduce((sum, w) => sum + w.volume, 0);
    
    const session = {
        id: Date.now(),
        date: new Date().toISOString(),
        exercises: [...todayWorkouts],
        totalSets: totalSets,
        totalVolume: totalVolume
    };
    
    workoutHistory.unshift(session);
    
    if (workoutHistory.length > 50) {
        workoutHistory = workoutHistory.slice(0, 50);
    }
    
    todayWorkouts = [];
    saveToStorage();
    updateUI();
    
    alert(`Workout completed! 🎉\n${totalSets} sets | ${totalVolume.toLocaleString()} lbs total volume`);
}

function updateHistory() {
    const container = document.getElementById('historyList');
    const clearBtn = document.getElementById('clearBtn');
    
    if (workoutHistory.length === 0) {
        container.innerHTML = '<p class="empty-state">No workout history yet.</p>';
        clearBtn.style.display = 'none';
        return;
    }
    
    clearBtn.style.display = 'block';
    
    container.innerHTML = workoutHistory.slice(0, 10).map(session => {
        const date = new Date(session.date);
        const dateStr = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        const exercises = session.exercises
            .map(e => `${e.exercise} (${e.sets}×${e.reps})`)
            .join(', ');
        
        return `
            <div class="history-item">
                <div class="history-date">${dateStr} - ${session.totalSets} sets | ${session.totalVolume.toLocaleString()} lbs</div>
                <div class="history-exercises">${exercises}</div>
            </div>
        `;
    }).join('');
}

function clearHistory() {
    if (confirm('Clear all workout history? This cannot be undone.')) {
        workoutHistory = [];
        saveToStorage();
        updateUI();
    }
}

function saveToStorage() {
    try {
        localStorage.setItem('todayWorkouts', JSON.stringify(todayWorkouts));
        localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    } catch (e) {
        console.error('Failed to save to storage', e);
    }
}

function loadFromStorage() {
    try {
        const today = localStorage.getItem('todayWorkouts');
        const history = localStorage.getItem('workoutHistory');
        
        if (today) todayWorkouts = JSON.parse(today);
        if (history) workoutHistory = JSON.parse(history);
        
        if (todayWorkouts.length > 0) {
            const lastWorkout = new Date(todayWorkouts[0].timestamp);
            const now = new Date();
            if (lastWorkout.toDateString() !== now.toDateString()) {
                if (todayWorkouts.length > 0) {
                    finishWorkout();
                }
            }
        }
    } catch (e) {
        console.error('Failed to load from storage', e);
    }
}

let deferredPrompt;

function setupInstallPrompt() {
    const installBtn = document.getElementById('installBtn');
    
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        installBtn.style.display = 'block';
    });
    
    installBtn.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('App installed');
        }
        
        deferredPrompt = null;
        installBtn.style.display = 'none';
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
        e.preventDefault();
        logWorkout();
    }
});
