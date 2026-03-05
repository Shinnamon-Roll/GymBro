document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
});

async function fetchSchedule() {
    try {
        const res = await fetch(`${window.API}/sessions?today=true`); // Get today's sessions only
        if (!res.ok) throw new Error('Failed to fetch schedule');
        const sessions = await res.json();
        renderSchedule(sessions);
    } catch (error) {
        console.error(error);
        document.getElementById('schedule-table-body').innerHTML = `
            <tr><td colspan="4" class="p-4 text-center text-red-500 font-bold">Error loading schedule.</td></tr>
        `;
    }
}

function renderSchedule(sessions) {
    const tbody = document.getElementById('schedule-table-body');
    tbody.innerHTML = '';

    if (sessions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center font-bold text-secondary">No bookings found.</td></tr>`;
        return;
    }

    const sessionData = JSON.parse(localStorage.getItem('gymbro_user'));
    const myId = sessionData?.user?.id;

    sessions.forEach(s => {
        const date = new Date(s.sessionDate);
        const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
        const dateTimeStr = `${dateStr} ${timeStr}`;

        // Check if this session belongs to the current user
        // Note: Backend response structure depends on Sequelize. 
        // Usually customerId is present if defined in model, or accessed via customer.id
        const customerId = s.customerId || (s.customer ? s.customer.id : null);
        const isMySession = customerId === myId;
        
        // Row styling
        const tr = document.createElement('tr');
        if (isMySession) {
            tr.className = "bg-accent/10 border-l-4 border-accent transition-colors border-b border-gray-100";
        } else {
            tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
        }
        
        tr.innerHTML = `
            <td class="p-4 font-bold text-primary font-mono">${dateTimeStr}</td>
            <td class="p-4 font-semibold text-secondary">
                ${s.equipment ? s.equipment.equipmentName : '<span class="text-gray-400">General Workout</span>'}
            </td>
            <td class="p-4 font-semibold">
                ${s.trainer ? s.trainer.trainerName : '<span class="text-gray-400">-</span>'}
            </td>
            <td class="p-4 text-center">
                ${isMySession 
                    ? '<span class="bg-accent text-primary px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm">My Booking</span>' 
                    : '<span class="bg-secondary text-white px-3 py-1 text-xs font-bold uppercase tracking-wider opacity-80">Occupied</span>'}
            </td>
        `;
        tbody.appendChild(tr);
    });
}
