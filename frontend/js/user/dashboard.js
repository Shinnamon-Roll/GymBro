
const API = window.API;

let allTrainers = [];
let allEquipments = [];
let dailySessions = [];

document.addEventListener('DOMContentLoaded', () => {
    fetchSchedule();
    fetchResources();
    
    // Event Listeners
    document.getElementById('btn-book-session').addEventListener('click', openBookingModal);
    document.getElementById('close-booking-modal').addEventListener('click', closeBookingModal);
    document.getElementById('cancel-booking').addEventListener('click', closeBookingModal);
    document.getElementById('booking-modal').addEventListener('click', (e) => {
        if (e.target.id === 'booking-modal') closeBookingModal();
    });

    // Form Change Listeners for Availability Check
    ['book-date', 'book-time', 'book-duration'].forEach(id => {
        document.getElementById(id).addEventListener('change', checkAvailability);
    });

    document.getElementById('booking-form').addEventListener('submit', handleBookingSubmit);
});

async function fetchResources() {
    try {
        const [tRes, eRes] = await Promise.all([
            fetch(`${API}/trainers`),
            fetch(`${API}/equipments`)
        ]);
        allTrainers = await tRes.json();
        allEquipments = await eRes.json();
    } catch (error) {
        console.error("Failed to fetch resources:", error);
    }
}

async function fetchSchedule() {
    try {
        // Fetch today's schedule for display
        const res = await fetch(`${API}/sessions?today=true`); 
        if (!res.ok) throw new Error('Failed to fetch schedule');
        const sessions = await res.json();
        renderSchedule(sessions);
    } catch (error) {
        console.error(error);
        const tbody = document.getElementById('schedule-table-body');
        if(tbody) {
            tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center text-red-500 font-bold">Error loading schedule.</td></tr>`;
        }
    }
}

function renderSchedule(sessions) {
    const tbody = document.getElementById('schedule-table-body');
    if(!tbody) return;
    tbody.innerHTML = '';

    if (sessions.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-4 text-center font-bold text-secondary">No bookings found today.</td></tr>`;
        return;
    }

    const sessionData = JSON.parse(localStorage.getItem('gymbro_user'));
    const myId = sessionData?.user?.id;

    sessions.forEach(s => {
        const date = new Date(s.sessionDate);
        // Interpret as UTC to match the "fake UTC" storage strategy
        // This effectively ignores the browser's timezone
        const dateStr = date.toLocaleDateString('th-TH', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('th-TH', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
        
        // Calculate End Time from endDate if exists, or assume 1 hour
        const endDate = s.endDate ? new Date(s.endDate) : new Date(date.getTime() + 60*60000);
        const endTimeStr = endDate.toLocaleTimeString('th-TH', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
        
        const dateTimeStr = `${dateStr} <br/> ${timeStr} - ${endTimeStr}`;

        // Check if this session belongs to the current user
        const customerId = s.customerId || (s.customer ? s.customer.id : null);
        const isMySession = customerId === myId;
        
        const tr = document.createElement('tr');
        if (isMySession) {
            tr.className = "bg-accent/10 border-l-4 border-accent transition-colors border-b border-gray-100";
        } else {
            tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
        }
        
        const equipName = s.equipment ? s.equipment.equipmentName : '<span class="text-gray-400">General Workout</span>';
        const trainerName = s.trainer ? s.trainer.trainerName : '<span class="text-gray-400">-</span>';

        let actionCell = '';
        if (isMySession) {
            actionCell = `
                <div class="flex flex-col items-center gap-1">
                    <span class="bg-accent text-primary px-3 py-1 text-xs font-black uppercase tracking-wider shadow-sm">My Booking</span>
                    <button onclick="window.cancelSession(${s.id})" class="text-xs text-red-500 hover:text-red-700 font-bold underline cursor-pointer">Cancel</button>
                </div>
            `;
        } else {
            actionCell = '<span class="bg-secondary text-white px-3 py-1 text-xs font-bold uppercase tracking-wider opacity-80">Occupied</span>';
        }

        tr.innerHTML = `
            <td class="p-4 font-bold text-primary font-mono text-sm">${dateTimeStr}</td>
            <td class="p-4 font-semibold text-secondary">${equipName}</td>
            <td class="p-4 font-semibold">${trainerName}</td>
            <td class="p-4 text-center">
                ${actionCell}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Modal Functions
function openBookingModal() {
    document.getElementById('booking-modal').classList.remove('hidden');
    
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('book-date').value = today;
    document.getElementById('book-time').value = "09:00"; // Default time
    
    populateSelects();
    checkAvailability(); // Initial check
}

function closeBookingModal() {
    document.getElementById('booking-modal').classList.add('hidden');
}

function populateSelects() {
    const trainerSelect = document.getElementById('book-trainer');
    const equipmentSelect = document.getElementById('book-equipment');
    
    trainerSelect.innerHTML = '<option value="">-- No Trainer --</option>';
    allTrainers.forEach(t => {
        trainerSelect.innerHTML += `<option value="${t.id}">${t.trainerName} (${t.specialty || 'General'})</option>`;
    });
    
    equipmentSelect.innerHTML = '<option value="">-- Select Equipment --</option>';
    allEquipments.forEach(e => {
        let statusText = "";
        if (e.status === 'Maintenance') statusText = " (Maintenance)";
        equipmentSelect.innerHTML += `<option value="${e.id}" ${e.status === 'Maintenance' ? 'disabled' : ''}>${e.equipmentName}${statusText}</option>`;
    });
}

async function checkAvailability() {
    const dateVal = document.getElementById('book-date').value;
    const timeVal = document.getElementById('book-time').value;
    const durationVal = parseInt(document.getElementById('book-duration').value);

    if (!dateVal || !timeVal) return;

    // Fetch sessions for the selected date
    try {
        const res = await fetch(`${API}/sessions?date=${dateVal}`);
        dailySessions = await res.json();
    } catch (e) {
        console.error("Failed to fetch daily sessions", e);
        return;
    }

    // Calculate requested time range
    const start = new Date(`${dateVal}T${timeVal}`);
    const end = new Date(start.getTime() + durationVal * 60000);

    // Reset options
    const trainerOptions = document.getElementById('book-trainer').options;
    const equipmentOptions = document.getElementById('book-equipment').options;

    // Check Trainers
    for (let i = 0; i < trainerOptions.length; i++) {
        const opt = trainerOptions[i];
        if (!opt.value) continue; // Skip placeholder
        
        const trainerId = parseInt(opt.value);
        // Find if busy
        const isBusy = dailySessions.some(s => {
            if (s.trainerId !== trainerId) return false;
            const sStart = new Date(s.sessionDate);
            const sEnd = s.endDate ? new Date(s.endDate) : new Date(sStart.getTime() + 60*60000);
            return (start < sEnd && end > sStart); // Overlap
        });

        if (isBusy) {
            opt.disabled = true;
            opt.text = opt.text.replace(" (Busy)", "") + " (Busy)";
        } else {
            opt.disabled = false;
            opt.text = opt.text.replace(" (Busy)", "");
        }
    }

    // Check Equipment
    for (let i = 0; i < equipmentOptions.length; i++) {
        const opt = equipmentOptions[i];
        if (!opt.value) continue; // Skip placeholder
        
        const equipmentId = parseInt(opt.value);
        const equipment = allEquipments.find(e => e.id === equipmentId);
        
        // Maintenance check already done in populate, but ensure it stays disabled
        if (equipment && equipment.status === 'Maintenance') {
            opt.disabled = true;
            continue;
        }

        // Busy check
        const isBusy = dailySessions.some(s => {
            if (s.equipmentId !== equipmentId) return false;
            const sStart = new Date(s.sessionDate);
            const sEnd = s.endDate ? new Date(s.endDate) : new Date(sStart.getTime() + 60*60000);
            return (start < sEnd && end > sStart); // Overlap
        });

        if (isBusy) {
            opt.disabled = true;
            opt.text = opt.text.replace(" (Booked)", "") + " (Booked)";
        } else {
            opt.disabled = false;
            opt.text = opt.text.replace(" (Booked)", "");
        }
    }
}

async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const dateVal = document.getElementById('book-date').value;
    const timeVal = document.getElementById('book-time').value;
    const durationVal = document.getElementById('book-duration').value;
    const trainerId = document.getElementById('book-trainer').value;
    const equipmentId = document.getElementById('book-equipment').value;

    if (!trainerId || !equipmentId) {
        alert("Please select both Trainer and Equipment.");
        return;
    }

    const sessionData = JSON.parse(localStorage.getItem('gymbro_user'));
    const customerId = sessionData?.user?.id;
    if (!customerId) {
        alert("User session not found. Please login again.");
        return;
    }

    const start = new Date(`${dateVal}T${timeVal}`);
    
    // Convert to fake UTC (preserve local time values)
    // Example: Input 09:00 Local -> Create Date 09:00 UTC
    // This ensures backend receives "09:00" in the ISO string (e.g., ...T09:00:00.000Z)
    // And backend stores 09:00. Frontend reads 09:00.
    const utcStart = new Date(Date.UTC(
        start.getFullYear(),
        start.getMonth(),
        start.getDate(),
        start.getHours(),
        start.getMinutes(),
        0
    ));

    const payload = {
        sessionDate: utcStart.toISOString(),
        duration: parseInt(durationVal),
        trainerId: parseInt(trainerId),
        equipmentId: parseInt(equipmentId),
        customerId: parseInt(customerId)
    };

    try {
        const res = await fetch(`${API}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            alert("Booking confirmed!");
            closeBookingModal();
            fetchSchedule(); // Refresh list
        } else {
            const err = await res.json();
            alert("Booking failed: " + (err.error || "Unknown error"));
        }
    } catch (error) {
        console.error("Booking error:", error);
        alert("Network error occurred.");
    }
}

// Global Cancel Function
window.cancelSession = async function(id) {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    
    try {
        const res = await fetch(`${API}/sessions/${id}`, {
            method: 'DELETE'
        });
        
        if (res.ok) {
            alert("Booking cancelled successfully.");
            fetchSchedule(); // Refresh list
        } else {
            const data = await res.json();
            alert("Failed to cancel: " + (data.error || "Unknown error"));
        }
    } catch (err) {
        console.error("Error cancelling session:", err);
        alert("Error cancelling session.");
    }
};
