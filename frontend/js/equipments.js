const API = window.API || "http://localhost:3000/api";

const tbody = document.getElementById("equipments-table");
const form = document.getElementById("equipment-form");
const nameEl = document.getElementById("name");
const statusEl = document.getElementById("status");

const statusOptions = ["Available", "Maintenance"];

const row = (e) => {
  const tr = document.createElement("tr");
  const sel = document.createElement("select");
  statusOptions.forEach((s) => {
    const o = document.createElement("option");
    o.value = s;
    o.textContent = s;
    if (s === e.status) o.selected = true;
    sel.appendChild(o);
  });
  sel.addEventListener("change", async () => {
    await fetch(`${API}/equipments/${e.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: sel.value }),
    });
  });
  const actions = document.createElement("td");
  actions.className = "actions";
  const del = document.createElement("button");
  del.className = "secondary";
  del.textContent = "ลบ";
  del.addEventListener("click", async () => {
    const r = await fetch(`${API}/equipments/${e.id}`, { method: "DELETE" });
    if (r.ok) load();
  });
  actions.appendChild(del);
  tr.appendChild(document.createElement("td")).textContent = e.id;
  tr.appendChild(document.createElement("td")).textContent = e.name;
  const tdSel = document.createElement("td");
  tdSel.appendChild(sel);
  tr.appendChild(tdSel);
  tr.appendChild(actions);
  return tr;
};

const load = async () => {
  const data = await fetch(`${API}/equipments`).then((r) => r.json());
  tbody.innerHTML = "";
  data.forEach((e) => tbody.appendChild(row(e)));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { name: nameEl.value.trim(), status: statusEl.value };
  const r = await fetch(`${API}/equipments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (r.ok) {
    form.reset();
    load();
  }
});

load();
