// Habits Module

let habits = [];
let logs = [];
let selectedHabitId = null;

// DOM Elements
const habitsList = document.getElementById('habits-list');
const emptyState = document.getElementById('empty-state');
const habitView = document.getElementById('habit-view');
const welcomeView = document.getElementById('welcome-view');
const habitModal = document.getElementById('habit-modal');
const habitForm = document.getElementById('habit-form');
const modalTitle = document.getElementById('modal-title');
const habitNameInput = document.getElementById('habit-name');
const addHabitBtn = document.getElementById('add-habit-btn');
const modalClose = document.getElementById('modal-close');
const cancelBtn = document.getElementById('cancel-btn');
const scheduleOptions = document.getElementsByName('schedule');
const daysGroup = document.getElementById('days-group');

// Load Habits
async function loadHabits() {
    try {
        const { data, error } = await supabase
            .from('habits')
            .select('*')
            .eq('user_id', currentUser.id)
            .eq('is_archived', false)
            .order('created_at', { ascending: true });
        
        if (error) throw error;
        
        window.habits = data || [];
        habits = window.habits;
        
        // Load logs
        const { data: logsData, error: logsError } = await supabase
            .from('habit_logs')
            .select('*')
            .eq('user_id', currentUser.id)
            .order('log_date', { ascending: false });
        
        if (logsError) throw logsError;
        
        window.logs = logsData || [];
        logs = window.logs;
        
        renderHabitsList();
        
        if (habits.length > 0 && !selectedHabitId) {
            selectHabit(habits[0].id);
        }
    } catch (error) {
        console.error('Error loading habits:', error);
    }
}

// Render Habits List
function renderHabitsList() {
    if (habits.length === 0) {
        emptyState.style.display = 'block';
        habitsList.innerHTML = '';
        habitsList.appendChild(emptyState);
        return;
    }
    
    emptyState.style.display = 'none';
    
    habitsList.innerHTML = habits.map(habit => {
        const habitLogs = logs.filter(l => l.habit_id === habit.id);
        const today = getToday();
        const isDoneToday = habitLogs.some(l => l.log_date === today && l.status === 'done');
        const streak = calculateStreak(habit, logs);
        
        return `
            <div class="habit-item ${selectedHabitId === habit.id ? 'selected' : ''}" onclick="selectHabit('${habit.id}')">
                <div class="habit-item-header">
                    <div class="habit-icon">${getHabitIcon(habit.title)}</div>
                    <span class="habit-name">${habit.title}</span>
                    <span class="habit-schedule">${isDoneToday ? '✅' : '🔥'} ${streak}</span>
                </div>
                <div class="habit-schedule">${getScheduleText(habit)}</div>
            </div>
        `;
    }).join('');
}

// Select Habit
function selectHabit(id) {
    window.selectedHabitId = id;
    selectedHabitId = id;
    renderHabitsList();
    
    const habit = habits.find(h => h.id === id);
    if (!habit) return;
    
    welcomeView.style.display = 'none';
    habitView.style.display = 'block';
    
    document.getElementById('habit-title').textContent = habit.title;
    document.getElementById('habit-schedule').textContent = getScheduleText(habit);
    document.getElementById('habit-icon').textContent = getHabitIcon(habit.title);
    
    const stats = calculateStreak(habit, logs);
    document.getElementById('current-streak').textContent = stats.current;
    document.getElementById('best-streak').textContent = stats.best;
    document.getElementById('completion-rate').textContent = stats.rate + '%';
    document.getElementById('total-completions').textContent = stats.total;
    
    // Today's status
    const today = getToday();
    const todayLog = logs.find(l => l.habit_id === id && l.log_date === today);
    const checkBtn = document.getElementById('check-btn');
    
    if (todayLog && todayLog.status === 'done') {
        checkBtn.classList.add('completed');
        checkBtn.textContent = '✓';
        document.getElementById('today-status').textContent = 'Great job! Completed!';
        
        // Show note
        if (todayLog.note) {
            document.getElementById('note-display').style.display = 'flex';
            document.getElementById('note-text').textContent = todayLog.note;
            document.getElementById('note-btn').style.display = 'none';
        } else {
            document.getElementById('note-display').style.display = 'none';
            document.getElementById('note-btn').style.display = 'block';
        }
    } else {
        checkBtn.classList.remove('completed');
        checkBtn.textContent = '✓';
        document.getElementById('today-status').textContent = isDueOnDate(habit, today) ? 'Mark as complete' : 'Not due today';
        document.getElementById('note-display').style.display = 'none';
        document.getElementById('note-btn').style.display = 'none';
    }
    
    // Render heatmap
    renderHeatmap(habit, logs);
}

// Toggle Check-in
document.getElementById('check-btn').addEventListener('click', async () => {
    if (!selectedHabitId) return;
    
    const today = getToday();
    const existingLog = logs.find(l => l.habit_id === selectedHabitId && l.log_date === today);
    
    try {
        if (existingLog) {
            // Remove check-in
            const { error } = await supabase
                .from('habit_logs')
                .delete()
                .eq('id', existingLog.id);
            
            if (error) throw error;
            
            logs = logs.filter(l => l.id !== existingLog.id);
        } else {
            // Add check-in
            const { data, error } = await supabase
                .from('habit_logs')
                .insert({
                    user_id: currentUser.id,
                    habit_id: selectedHabitId,
                    log_date: today,
                    status: 'done'
                })
                .select()
                .single();
            
            if (error) throw error;
            
            logs.push(data);
        }
        
        selectHabit(selectedHabitId);
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Open Modal for New Habit
addHabitBtn.addEventListener('click', () => {
    modalTitle.textContent = 'Create Habit';
    habitForm.reset();
    habitNameInput.value = '';
    daysGroup.style.display = 'none';
    habitModal.classList.add('active');
});

// Close Modal
modalClose.addEventListener('click', () => {
    habitModal.classList.remove('active');
});

cancelBtn.addEventListener('click', () => {
    habitModal.classList.remove('active');
});

// Schedule Type Toggle
scheduleOptions.forEach(option => {
    option.addEventListener('change', () => {
        if (option.value === 'specific') {
            daysGroup.style.display = 'block';
        } else {
            daysGroup.style.display = 'none';
        }
    });
});

// Save Habit
habitForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const title = habitNameInput.value.trim();
    if (!title) return;
    
    const scheduleType = Array.from(scheduleOptions).find(o => o.checked).value;
    
    let daysOfWeek = [];
    if (scheduleType === 'specific') {
        daysOfWeek = Array.from(document.querySelectorAll('#days-group input:checked'))
            .map(input => parseInt(input.value));
    }
    
    try {
        const { data, error } = await supabase
            .from('habits')
            .insert({
                user_id: currentUser.id,
                title,
                schedule_type: scheduleType === 'daily' ? 'daily' : 'specific_days',
                days_of_week: daysOfWeek
            })
            .select()
            .single();
        
        if (error) throw error;
        
        habits.push(data);
        habitModal.classList.remove('active');
        selectHabit(data.id);
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Delete Habit
document.getElementById('delete-habit-btn').addEventListener('click', async () => {
    if (!selectedHabitId) return;
    
    if (!confirm('Are you sure you want to delete this habit? All logs will be lost.')) return;
    
    try {
        // Delete logs first
        await supabase
            .from('habit_logs')
            .delete()
            .eq('habit_id', selectedHabitId);
        
        // Delete habit
        const { error } = await supabase
            .from('habits')
            .delete()
            .eq('id', selectedHabitId);
        
        if (error) throw error;
        
        habits = habits.filter(h => h.id !== selectedHabitId);
        logs = logs.filter(l => l.habit_id !== selectedHabitId);
        
        if (habits.length > 0) {
            selectHabit(habits[0].id);
        } else {
            selectedHabitId = null;
            welcomeView.style.display = 'flex';
            habitView.style.display = 'none';
        }
        
        renderHabitsList();
    } catch (error) {
        alert('Error: ' + error.message);
    }
});

// Helper Functions
function getToday() {
    return new Date().toISOString().split('T')[0];
}

function isDueOnDate(habit, date) {
    if (habit.schedule_type === 'daily') return true;
    if (habit.schedule_type === 'specific_days') {
        const dayOfWeek = new Date(date).getDay();
        return habit.days_of_week.includes(dayOfWeek);
    }
    return true;
}

function getScheduleText(habit) {
    if (habit.schedule_type === 'daily') return 'Every day';
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (habit.schedule_type === 'specific_days' && habit.days_of_week) {
        return habit.days_of_week.map(d => days[d]).join(', ');
    }
    
    return 'Every day';
}

function getHabitIcon(title) {
    const icons = ['🏃', '📚', '🧘', '💧', '🍎', '😴', '✍️', '🎸', '💻', '🎯', '🌱', '🧠'];
    const index = title.charCodeAt(0) % icons.length;
    return icons[index];
}

// Load habits when auth is ready
window.addEventListener('DOMContentLoaded', () => {
    if (currentUser) {
        loadHabits();
    }
});

// Expose functions globally
window.loadHabits = loadHabits;
window.selectHabit = selectHabit;
