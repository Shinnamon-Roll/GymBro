const API = window.API;

const setText = (id, v) => {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
};

const renderSessions = (rows) => {
  const tbody = document.getElementById("today-sessions");
  tbody.innerHTML = "";
  if (!rows || rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-gray-400 italic">No sessions scheduled for today.</td></tr>`;
    return;
  }
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
    tr.innerHTML = `
      <td class="p-4 font-bold text-primary">${r.customer?.fullName || "Unknown"}</td>
      <td class="p-4 font-semibold">${r.trainer?.trainerName || "-"}</td>
      <td class="p-4">${r.equipment?.equipmentName || "Personal Training"}</td>
      <td class="p-4 text-sm font-mono text-secondary">${new Date(r.sessionDate).toLocaleString()}</td>
      <td class="p-4 text-center">
        <span class="bg-accent text-primary px-2 py-1 text-xs font-bold uppercase tracking-wide">Confirmed</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
};

const load = async () => {
  const summary = await fetch(`${API}/summary`).then((r) => r.json());
  setText("count-customers", summary.customers || 0);
  setText("count-trainers", summary.trainers || 0);
  setText("count-equipments", summary.equipments || 0);
  setText("count-sessions", summary.sessions_today || 0);
  const sessions = await fetch(`${API}/sessions?today=true`).then((r) => r.json());
  renderSessions(sessions);
};

load();
