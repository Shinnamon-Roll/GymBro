const API = window.API || "http://localhost:3000/api";

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
  const actions = document.createElement("td");
  actions.className = "actions";
  const del = document.createElement("button");
  del.className = "secondary";
  del.textContent = "ลบ";
  del.addEventListener("click", async () => {
    const r = await fetch(`${API}/sessions/${s.id}`, { method: "DELETE" });
    if (r.ok) loadSessions();
  });
  actions.appendChild(del);
  tr.innerHTML = `<td>${s.customer?.fullName || ""}</td><td>${s.trainer?.trainerName || ""}</td><td>${s.equipment?.equipmentName || ""}</td><td>${new Date(s.sessionDate).toLocaleString()}</td>`;
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
  const body = {
    customerId: parseInt(customerEl.value, 10),
    trainerId: parseInt(trainerEl.value, 10),
    equipmentId: parseInt(equipmentEl.value, 10),
    sessionDate: new Date(scheduledEl.value).toISOString(),
  };
  const r = await fetch(`${API}/sessions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (r.ok) {
    form.reset();
    loadSessions();
  }
});

const init = async () => {
  await loadLists();
  await loadSessions();
};

init();
