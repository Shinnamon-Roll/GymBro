const API = window.API;

const tbody = document.getElementById("sessions-table");
const form = document.getElementById("session-form");
const customerEl = document.getElementById("customer");
const trainerEl = document.getElementById("trainer");
const equipmentEl = document.getElementById("equipment");
const scheduledEl = document.getElementById("scheduled_at");

const opt = (v, t) => {
  const o = document.createElement("option");
  o.value = v;
  o.textContent = t;
  return o;
};

const row = (s) => {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
  
  const actions = document.createElement("td");
  actions.className = "p-4 text-center";
  const del = document.createElement("button");
  del.className = "text-red-500 hover:text-red-700 transition-colors font-bold uppercase text-xs border-b-2 border-transparent hover:border-red-700";
  del.textContent = "Cancel";
  del.addEventListener("click", async () => {
    if(confirm('Are you sure you want to cancel this session?')) {
      const r = await fetch(`${API}/sessions/${s.id}`, { method: "DELETE" });
      if (r.ok) loadSessions();
    }
  });
  actions.appendChild(del);

  const date = new Date(s.sessionDate);
  const dateStr = date.toLocaleDateString('th-TH', { timeZone: 'UTC', day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('th-TH', { timeZone: 'UTC', hour: '2-digit', minute: '2-digit' });
  const dateTimeStr = `${dateStr} ${timeStr}`;

  tr.innerHTML = `
    <td class="p-4 font-bold text-primary">${s.customer?.fullName || "Unknown"}</td>
    <td class="p-4 font-semibold">${s.trainer?.trainerName || "-"}</td>
    <td class="p-4">${s.equipment?.equipmentName || "Personal Training"}</td>
    <td class="p-4 text-sm font-mono text-secondary">${dateTimeStr}</td>
  `;
  tr.appendChild(actions);
  return tr;
};

const loadLists = async () => {
  const [customers, trainers, equipments] = await Promise.all([
    fetch(`${API}/customers`).then((r) => r.json()),
    fetch(`${API}/trainers`).then((r) => r.json()),
    fetch(`${API}/equipments`).then((r) => r.json()),
  ]);
  customerEl.innerHTML = "";
  trainerEl.innerHTML = "";
  equipmentEl.innerHTML = "";
  customers.forEach((c) => customerEl.appendChild(opt(c.id, c.fullName)));
  trainers.forEach((t) => trainerEl.appendChild(opt(t.id, t.trainerName)));
  equipments.forEach((e) => equipmentEl.appendChild(opt(e.id, e.equipmentName)));
};

const loadSessions = async () => {
  const data = await fetch(`${API}/sessions`).then((r) => r.json());
  tbody.innerHTML = "";
  data.forEach((s) => tbody.appendChild(row(s)));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const scheduledDate = new Date(scheduledEl.value);
  // Convert to fake UTC (preserve local time values)
  const utcScheduled = new Date(Date.UTC(
    scheduledDate.getFullYear(),
    scheduledDate.getMonth(),
    scheduledDate.getDate(),
    scheduledDate.getHours(),
    scheduledDate.getMinutes(),
    0
  ));

  const body = {
    customerId: parseInt(customerEl.value, 10),
    trainerId: parseInt(trainerEl.value, 10),
    equipmentId: parseInt(equipmentEl.value, 10),
    sessionDate: utcScheduled.toISOString(),
    duration: 60 // Default 1 hour for admin created sessions
  };
  
  try {
    const r = await fetch(`${API}/sessions`, { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(body) 
    });
    
    if (r.ok) {
        alert("Session created successfully!");
        form.reset();
        loadSessions();
    } else {
        const err = await r.json();
        alert("Failed to create session: " + (err.error || "Unknown error"));
    }
  } catch (error) {
    console.error("Error creating session:", error);
    alert("Network error occurred.");
  }
});

const init = async () => {
  await loadLists();
  await loadSessions();
};

init();
