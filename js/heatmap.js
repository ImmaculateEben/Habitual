// Heatmap Module

function renderHeatmap(habit, allLogs) {
    const heatmap = document.getElementById('heatmap');
    const habitLogs = allLogs.filter(l => l.habit_id === habit.id);
    
    // Generate last 365 days
    const days = [];
    const today = new Date();
    
    for (let i = 364; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split('T')[0]);
    }
    
    heatmap.innerHTML = days.map(date => {
        const log = habitLogs.find(l => l.log_date === date);
        const due = isHabitDueOnDate(habit, date);
        
        let className = 'heatmap-day';
        
        if (log && log.status === 'done') {
            className += ' completed';
        } else if (due && date < today.toISOString().split('T')[0]) {
            className += ' missed';
        }
        
        return `<div class="${className}" title="${date}"></div>`;
    }).join('');
}

function isHabitDueOnDate(habit, date) {
    if (habit.schedule_type === 'daily') return true;
    
    if (habit.schedule_type === 'specific_days' && habit.days_of_week) {
        const dayOfWeek = new Date(date).getDay();
        return habit.days_of_week.includes(dayOfWeek);
    }
    
    return true;
}
