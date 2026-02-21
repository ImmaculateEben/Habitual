// Main App Initialization

// Use the supabase client from window
const supabase = window.supabase;

// Set current date
function setCurrentDate() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateDisplay = document.getElementById('current-date');
    if (dateDisplay) {
        dateDisplay.textContent = now.toLocaleDateString('en-US', options);
    }
}

// Dark Mode Toggle
const darkModeBtn = document.getElementById('dark-mode-btn');
let isDarkMode = false;

darkModeBtn.addEventListener('click', () => {
    isDarkMode = !isDarkMode;
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    darkModeBtn.textContent = isDarkMode ? '☀️' : '🌙';
});

// Export Data
document.getElementById('export-btn').addEventListener('click', () => {
    const data = {
        habits: window.habits || [],
        logs: window.logs || [],
        exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitual-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
});

// Import Data
document.getElementById('import-btn').addEventListener('click', () => {
    document.getElementById('import-file').click();
});

document.getElementById('import-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const data = JSON.parse(event.target.result);
            
            if (data.habits && data.habits.length > 0) {
                // Import habits
                for (const habit of data.habits) {
                    await supabase.from('habits').insert({
                        user_id: currentUser.id,
                        title: habit.title,
                        schedule_type: habit.schedule_type,
                        days_of_week: habit.days_of_week,
                        is_archived: habit.is_archived
                    });
                }
            }
            
            if (data.logs && data.logs.length > 0) {
                // Import logs
                for (const log of data.logs) {
                    const habit = (window.habits || []).find(h => h.title === log.habit_title);
                    if (habit) {
                        await supabase.from('habit_logs').insert({
                            user_id: currentUser.id,
                            habit_id: habit.id,
                            log_date: log.log_date,
                            status: log.status,
                            note: log.note
                        });
                    }
                }
            }
            
            alert('Import successful!');
            location.reload();
        } catch (error) {
            alert('Error importing: ' + error.message);
        }
    };
    reader.readAsText(file);
    e.target.value = '';
});

// Note Modal
const noteModal = document.getElementById('note-modal');
const noteBtn = document.getElementById('note-btn');
const noteModalClose = document.getElementById('note-modal-close');
const noteCancelBtn = document.getElementById('note-cancel-btn');
const noteForm = document.getElementById('note-form');
const noteInput = document.getElementById('note-input');

if (noteBtn) {
    noteBtn.addEventListener('click', () => {
        noteModal.classList.add('active');
        const today = getTodayNote();
        noteInput.value = today ? today.note : '';
    });
}

noteModalClose.addEventListener('click', () => {
    noteModal.classList.remove('active');
});

noteCancelBtn.addEventListener('click', () => {
    noteModal.classList.remove('active');
});

noteForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const today = getToday();
    const note = noteInput.value.trim();
    
    const existingLog = window.logs.find(l => l.habit_id === window.selectedHabitId && l.log_date === today);
    
    try {
        if (existingLog) {
            await supabase
                .from('habit_logs')
                .update({ note: note || null })
                .eq('id', existingLog.id);
        } else {
            await supabase
                .from('habit_logs')
                .insert({
                    user_id: currentUser.id,
                    habit_id: window.selectedHabitId,
                    log_date: today,
                    status: 'done',
                    note: note || null
                });
        }
        
        noteModal.classList.remove('active');
        window.selectHabit(window.selectedHabitId);
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

function getTodayNote() {
    const today = getToday();
    return window.logs.find(l => l.habit_id === window.selectedHabitId && l.log_date === today);
}

function getToday() {
    return new Date().toISOString().split('T')[0];
}

// Expose functions to global scope
window.selectHabit = function(id) {
    // This will be handled by habits.js
    if (typeof window.habits !== 'undefined') {
        const { selectHabit } = window;
        if (selectHabit) selectHabit(id);
    }
};

// Initialize
setCurrentDate();
