// Charts Module - Using simple CSS-based chart (no external library)

function renderCompletionChart(habit, logs) {
    const container = document.getElementById('completion-chart');
    const habitLogs = logs.filter(l => l.habit_id === habit.id && l.status === 'done');
    
    // Last 14 days
    const days = [];
    for (let i = 13; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push({
            date: date.toISOString().split('T')[0],
            day: date.toLocaleDateString('en-US', { weekday: 'short' })
        });
    }
    
    const completed = days.map(d => habitLogs.some(l => l.log_date === d.date) ? 1 : 0);
    const max = Math.max(...completed, 1);
    
    container.innerHTML = `
        <div style="display: flex; align-items: flex-end; gap: 8px; height: 200px; padding: 20px;">
            ${days.map((d, i) => `
                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px;">
                    <div style="width: 100%; background: ${completed[i] ? '#10b981' : '#e2e8f0'}; height: ${(completed[i] / max) * 150}px; border-radius: 4px;"></div>
                    <span style="font-size: 10px; color: var(--text-secondary);">${d.day}</span>
                </div>
            `).join('')}
        </div>
    `;
}
