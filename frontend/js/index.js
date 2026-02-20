const API = window.API || "http://localhost:3000/api";

const setText = (id, v) => {
  const el = document.getElementById(id);
  if (el) el.textContent = v;
};

const renderSessions = (rows) => {
  const tbody = document.getElementById("today-sessions");
  tbody.innerHTML = "";
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.customer_name}</td><td>${r.trainer_name}</td><td>${r.equipment_name}</td><td>${new Date(r.scheduled_at).toLocaleString()}</td>`;
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
