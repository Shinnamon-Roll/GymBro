const API = window.API;

const tbody = document.getElementById("logs-table");

const row = (log) => {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
  
  const date = new Date(log.timestamp);
  const dateStr = date.toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  // Action Badge Color
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
    tbody.innerHTML = '<tr><td colspan="3" class="p-4 text-center">Loading logs...</td></tr>';
    const logs = await fetch(`${API}/logs`).then((r) => r.json());
    tbody.innerHTML = "";
    
    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-400 italic">No logs found.</td></tr>`;
      return;
    }

    logs.forEach((log) => tbody.appendChild(row(log)));
  } catch (error) {
    console.error("Error loading logs:", error);
    tbody.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-red-500 font-bold">Error loading logs.</td></tr>`;
  }
};

// Expose to global scope for refresh button
window.loadLogs = loadLogs;

document.addEventListener('DOMContentLoaded', loadLogs);