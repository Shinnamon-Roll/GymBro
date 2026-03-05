const API = window.API;

const tbody = document.getElementById("equipments-table");
const form = document.getElementById("equipment-form");
const nameEl = document.getElementById("name");
const categoryEl = document.getElementById("category");
const statusEl = document.getElementById("status");

const statusOptions = ["Available", "Maintenance"];

const row = (e) => {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
  
  // Status Selector
  const sel = document.createElement("select");
  sel.className = "bg-white border border-primary p-1 text-xs font-bold uppercase focus:outline-none focus:border-accent";
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
    // Optional: Refresh or show toast
  });

  // Actions
  const actions = document.createElement("td");
  actions.className = "p-4 text-center";
  const del = document.createElement("button");
  del.className = "text-red-500 hover:text-red-700 transition-colors font-bold uppercase text-xs border-b-2 border-transparent hover:border-red-700";
  del.textContent = "Delete";
  del.addEventListener("click", async () => {
    if(confirm('Are you sure you want to delete this equipment?')) {
      const r = await fetch(`${API}/equipments/${e.id}`, { method: "DELETE" });
      if (r.ok) load();
    }
  });
  actions.appendChild(del);

  tr.innerHTML = `
    <td class="p-4 font-bold text-primary">#${e.id}</td>
    <td class="p-4 font-bold">${e.equipmentName}</td>
    <td class="p-4 font-semibold text-secondary">${e.category || "-"}</td>
  `;
  
  const tdSel = document.createElement("td");
  tdSel.className = "p-4";
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
  const body = {
    equipmentName: nameEl.value.trim(),
    category: categoryEl.value.trim() || null,
    status: statusEl.value,
  };
  const r = await fetch(`${API}/equipments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (r.ok) {
    form.reset();
    load();
  }
});

load();
