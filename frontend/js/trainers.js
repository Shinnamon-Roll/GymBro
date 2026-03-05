const API = window.API;

const tbody = document.getElementById("trainers-table");
const form = document.getElementById("trainer-form");
const nameEl = document.getElementById("name");
const specEl = document.getElementById("specialty");
const levelEl = document.getElementById("trainerLevel");
const phoneEl = document.getElementById("phone");

const row = (t) => {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
  
  tr.innerHTML = `
    <td class="p-4 font-bold text-primary">#${t.id}</td>
    <td class="p-4 font-bold">${t.trainerName}</td>
    <td class="p-4 font-semibold text-secondary">${t.specialty || "-"}</td>
    <td class="p-4"><span class="bg-secondary text-white px-2 py-1 text-xs font-bold uppercase">${t.trainerLevel}</span></td>
    <td class="p-4 text-sm font-mono">${t.phone || "-"}</td>
    <td class="p-4 text-center">
      <div class="flex justify-center gap-2">
        <button data-id="${t.id}" data-action="edit" class="text-accent hover:text-primary transition-colors font-bold uppercase text-xs border-b-2 border-transparent hover:border-primary">Edit</button>
        <button data-id="${t.id}" data-action="delete" class="text-red-500 hover:text-red-700 transition-colors font-bold uppercase text-xs border-b-2 border-transparent hover:border-red-700">Delete</button>
      </div>
    </td>
  `;
  return tr;
};

const load = async () => {
  const data = await fetch(`${API}/trainers`).then((r) => r.json());
  tbody.innerHTML = "";
  data.forEach((t) => tbody.appendChild(row(t)));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    trainerName: nameEl.value.trim(),
    specialty: specEl.value.trim() || null,
    trainerLevel: levelEl.value,
    phone: phoneEl.value.trim() || null,
  };
  const r = await fetch(`${API}/trainers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (r.ok) {
    form.reset();
    load();
  }
});

tbody.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const action = btn.getAttribute("data-action");
  if (action === "delete") {
    const r = await fetch(`${API}/trainers/${id}`, { method: "DELETE" });
    if (r.ok) load();
  }
  if (action === "edit") {
    try {
      // 1. Fetch current data
      const currentData = await fetch(`${API}/trainers/${id}`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch trainer");
        return r.json();
      });

      // 2. Prompt with pre-filled values
      const name = prompt("ชื่อ", currentData.trainerName || "");
      if (name === null) return;

      const specialty = prompt("ความเชี่ยวชาญ", currentData.specialty || "");
      if (specialty === null) return;

      if (name) {
        const r = await fetch(`${API}/trainers/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trainerName: name, specialty }),
        });
        if (r.ok) load();
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching trainer data");
    }
  }
});

load();
