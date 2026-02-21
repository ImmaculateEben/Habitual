// Streak Calculation Module

function calculateStreak(habit, logs) {
    const habitLogs = logs.filter(l => l.habit_id === habit.id && l.status === 'done');
    
    if (habitLogs.length === 0) {
        return { current: 0, best: 0, rate: 0, total: 0 };
    }
    
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date();
    const today = new Date().toISOString().split('T')[0];
    const todayLog = habitLogs.find(l => l.log_date === today);
    
    // If done today, start from today. Otherwise, start from yesterday
    if (todayLog) {
        currentStreak = 1;
        checkDate.setDate(checkDate.getDate() - 1);
    }
    
    // Count backward
    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        
        if (isHabitDueOnDate(habit, dateStr)) {
            const log = habitLogs.find(l => l.log_date === dateStr);
            if (log) {
                currentStreak++;
            } else {
                break;
            }
        }
        
        checkDate.setDate(checkDate.getDate() - 1);
        
        // Safety limit
        if (currentStreak > 365) break;
    }
    
    // Calculate best streak
    const sortedDates = habitLogs
        .filter(l => isHabitDueOnDate(habit, l.log_date))
        .map(l => l.log_date)
        .sort();
    
    let bestStreak = 0;
    let tempStreak = 0;
    let lastDate = null;
    
    for (const date of sortedDates) {
        if (lastDate === null) {
            tempStreak = 1;
        } else {
            const diff = Math.floor((new Date(date) - new Date(lastDate)) / (1000 * 60 * 60 * 24));
            if (diff === 1) {
                tempStreak++;
            } else {
                tempStreak = 1;
            }
        }
        
        bestStreak = Math.max(bestStreak, tempStreak);
        lastDate = date;
    }
    
    bestStreak = Math.max(bestStreak, currentStreak);
    
    // Calculate completion rate
    const createdAt = new Date(habit.created_at);
    const todayDate = new Date();
    
    let dueDays = 0;
    let completedDays = 0;
    
    let checkDateRate = new Date(createdAt);
    while (checkDateRate <= todayDate) {
        const dateStr = checkDateRate.toISOString().split('T')[0];
        
        if (isHabitDueOnDate(habit, dateStr)) {
            dueDays++;
            if (habitLogs.some(l => l.log_date === dateStr)) {
                completedDays++;
            }
        }
        
        checkDateRate.setDate(checkDateRate.getDate() + 1);
    }
    
    const rate = dueDays > 0 ? Math.round((completedDays / dueDays) * 100) : 0;
    
    return {
        current: currentStreak,
        best: bestStreak,
        rate: rate,
        total: habitLogs.length
    };
}

function isHabitDueOnDate(habit, date) {
    if (habit.schedule_type === 'daily') return true;
    
    if (habit.schedule_type === 'specific_days' && habit.days_of_week) {
        const dayOfWeek = new Date(date).getDay();
        return habit.days_of_week.includes(dayOfWeek);
    }
    
    return true;
}
