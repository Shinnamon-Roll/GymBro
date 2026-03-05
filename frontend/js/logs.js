
const API = window.API;

const logsTbody = document.getElementById("logs-table");
const customerTbody = document.getElementById("customer-report-table");
const trainerTbody = document.getElementById("trainer-report-table");
let currentTab = 'logs';
let filterDate = null;

// Helper to format date/time
const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    // Use UTC to match storage strategy
    return date.toLocaleDateString('th-TH', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = (dateStr) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    // Use UTC to match storage strategy
    return date.toLocaleTimeString('th-TH', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
};

const calcDuration = (startStr, endStr) => {
    if (!startStr || !endStr) return "-";
    const start = new Date(startStr);
    const end = new Date(endStr);
    const diffMs = end.getTime() - start.getTime(); // Use .getTime() to be safe
    if (diffMs < 0) return "-";
    
    const diffMins = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    if (hours > 0) return `${hours} hr ${mins} min`;
    return `${mins} min`;
};

// Filter Functions
function applyDateFilter() {
    const dateVal = document.getElementById('filter-date').value;
    if (dateVal) {
        filterDate = dateVal;
    } else {
        filterDate = null;
    }
    refreshCurrentTab();
}

function clearDateFilter() {
    document.getElementById('filter-date').value = '';
    filterDate = null;
    refreshCurrentTab();
}

function refreshCurrentTab() {
    if (currentTab === 'logs') loadLogs();
    else if (currentTab === 'customer') loadCustomerReport();
    else if (currentTab === 'trainer') loadTrainerReport();
}

// System Logs Logic
// Note: System Logs are from JSON file which might use local server time (with Z or without).
// If they are ISO strings from Date().toISOString(), they are UTC.
// Let's assume standard ISO UTC for logs too.
const logRow = (log) => {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
  
  const date = new Date(log.timestamp);
  // Logs might be different, but let's try UTC first. If logs look wrong, we can revert.
  // Actually, logAction uses new Date().toISOString() in backend. So it IS UTC.
  // So we should display it in Local Time (because it's a timestamp of an action, not a "Booking Slot").
  // Booking Slot = "I want 9:00". Action Log = "I did this at X time".
  // Action Log should reflect User's Local Time.
  // So KEEP Logs as is (Browser Local).
  
  const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  let badgeClass = "bg-gray-500";
  if (log.action.includes("Create")) badgeClass = "bg-green-600";
  else if (log.action.includes("Update")) badgeClass = "bg-yellow-600";
  else if (log.action.includes("Delete")) badgeClass = "bg-red-600";

  tr.innerHTML = `
    <td class="p-4 font-mono text-primary text-xs">
      <div class="font-bold">${dateStr}</div>
      <div class="text-gray-500">${timeStr}</div>
    </td>
    <td class="p-4">
      <span class="${badgeClass} text-white px-2 py-1 text-xs font-bold uppercase tracking-wide rounded-sm">${log.action}</span>
    </td>
    <td class="p-4 text-secondary font-medium">
      ${log.details}
    </td>
  `;
  return tr;
};

const loadLogs = async () => {
  try {
    logsTbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center">Loading logs...</td></tr>';
    
    // Logs API doesn't support date filter yet in backend, but let's implement if needed.
    // Assuming backend /api/logs returns all, we might filter client side for JSON file logs
    // Or just fetch all for now. The prompt asked for Date Filter in "Report" (Customer/Trainer).
    // But let's support it if possible.
    // Since logs are JSON file, we can't easily query param filter without backend change.
    // I'll skip date filter for System Logs unless user insisted on "Report (Customer and Trainer)".
    // User said: "ต้องการให้หน้า Report (ทั้งส่วนของ Customer และ Trainer) สามารถกรองดูข้อมูลตามวันที่ระบุได้"
    // So System Logs is optional? I will filter client side if date is set.
    
    const logs = await fetch(`${API}/logs`).then((r) => r.json());
    logsTbody.innerHTML = "";
    
    let filteredLogs = logs;
    if (filterDate) {
        filteredLogs = logs.filter(l => l.timestamp.startsWith(filterDate));
    }

    if (filteredLogs.length === 0) {
      logsTbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-400 italic">No logs found.</td></tr>`;
      return;
    }
    filteredLogs.forEach((log) => logsTbody.appendChild(logRow(log)));
  } catch (error) {
    console.error("Error loading logs:", error);
    logsTbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-red-500 font-bold">Error loading logs.</td></tr>`;
  }
};

// Customer Report Logic
const customerRow = (session) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
    
    const customerName = session.customer ? session.customer.fullName : "Unknown";
    const equipmentName = session.equipment ? session.equipment.equipmentName : "None";
    const trainerName = session.trainer ? session.trainer.trainerName : "None";
    const dateStr = formatDate(session.sessionDate);
    const timeRange = `${formatTime(session.sessionDate)} - ${formatTime(session.endDate)}`;
    const duration = calcDuration(session.sessionDate, session.endDate);

    tr.innerHTML = `
      <td class="p-4 font-bold text-primary">${customerName}</td>
      <td class="p-4 text-secondary">${equipmentName}</td>
      <td class="p-4 text-secondary">${trainerName}</td>
      <td class="p-4 text-secondary font-mono text-xs">
        <div class="font-bold">${dateStr}</div>
        <div>${timeRange}</div>
      </td>
      <td class="p-4 text-accent font-bold">${duration}</td>
    `;
    return tr;
};

const loadCustomerReport = async () => {
    try {
        customerTbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Loading data...</td></tr>';
        
        let url = `${API}/sessions?all=true`;
        if (filterDate) {
            url = `${API}/sessions?date=${filterDate}`;
        }
        
        const sessions = await fetch(url).then(r => r.json());
        customerTbody.innerHTML = "";

        if (sessions.length === 0) {
            customerTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">No history found.</td></tr>`;
            return;
        }

        sessions.forEach(s => customerTbody.appendChild(customerRow(s)));
    } catch (error) {
        console.error("Error loading customer report:", error);
        customerTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500 font-bold">Error loading data.</td></tr>`;
    }
};

// Trainer Report Logic
const trainerRow = (session) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
    
    const trainerName = session.trainer ? session.trainer.trainerName : "Unknown";
    const customerName = session.customer ? session.customer.fullName : "Unknown";
    const equipmentName = session.equipment ? session.equipment.equipmentName : "None";
    const dateStr = formatDate(session.sessionDate);
    const timeRange = `${formatTime(session.sessionDate)} - ${formatTime(session.endDate)}`;
    const duration = calcDuration(session.sessionDate, session.endDate);

    tr.innerHTML = `
      <td class="p-4 font-bold text-primary">${trainerName}</td>
      <td class="p-4 text-secondary">${customerName}</td>
      <td class="p-4 text-secondary">${equipmentName}</td>
      <td class="p-4 text-secondary font-mono text-xs">
        <div class="font-bold">${dateStr}</div>
        <div>${timeRange}</div>
      </td>
      <td class="p-4 text-accent font-bold">${duration}</td>
    `;
    return tr;
};

const loadTrainerReport = async () => {
    try {
        trainerTbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center">Loading data...</td></tr>';
        
        let url = `${API}/sessions?all=true`;
        if (filterDate) {
            url = `${API}/sessions?date=${filterDate}`;
        }

        const sessions = await fetch(url).then(r => r.json());
        trainerTbody.innerHTML = "";

        if (sessions.length === 0) {
            trainerTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">No history found.</td></tr>`;
            return;
        }

        sessions.forEach(s => trainerTbody.appendChild(trainerRow(s)));
    } catch (error) {
        console.error("Error loading trainer report:", error);
        trainerTbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-red-500 font-bold">Error loading data.</td></tr>`;
    }
};

// Expose to global scope
window.loadLogs = loadLogs;
window.loadCustomerReport = loadCustomerReport;
window.loadTrainerReport = loadTrainerReport;
window.applyDateFilter = applyDateFilter;
window.clearDateFilter = clearDateFilter;
window.switchTab = (tabName) => {
    // Hide all sections
    document.getElementById('section-logs').classList.add('hidden');
    document.getElementById('section-customer').classList.add('hidden');
    document.getElementById('section-trainer').classList.add('hidden');
    
    // Reset tab styles
    ['logs', 'customer', 'trainer'].forEach(t => {
        const btn = document.getElementById(`tab-${t}`);
        btn.classList.remove('tab-active');
        btn.classList.add('tab-inactive');
    });

    // Show selected section
    document.getElementById(`section-${tabName}`).classList.remove('hidden');
    
    // Activate selected tab
    const activeBtn = document.getElementById(`tab-${tabName}`);
    activeBtn.classList.remove('tab-inactive');
    activeBtn.classList.add('tab-active');

    currentTab = tabName;
    refreshCurrentTab();
};

document.addEventListener('DOMContentLoaded', () => {
    loadLogs();
});
