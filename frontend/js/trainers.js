const API = window.API || "http://localhost:3000/api";

const tbody = document.getElementById("trainers-table");
const form = document.getElementById("trainer-form");
const nameEl = document.getElementById("name");
const specEl = document.getElementById("specialty");

const row = (t) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${t.id}</td><td>${t.name}</td><td>${t.specialty || ""}</td>
  <td class="actions">
    <button data-id="${t.id}" data-action="edit">แก้ไข</button>
    <button class="secondary" data-id="${t.id}" data-action="delete">ลบ</button>
  </td>`;
  return tr;
};

const load = async () => {
  const data = await fetch(`${API}/trainers`).then((r) => r.json());
  tbody.innerHTML = "";
  data.forEach((t) => tbody.appendChild(row(t)));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { name: nameEl.value.trim(), specialty: specEl.value.trim() || null };
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
    const name = prompt("ชื่อ", "");
    const specialty = prompt("ความเชี่ยวชาญ", "");
    if (name) {
      const r = await fetch(`${API}/trainers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, specialty }),
      });
      if (r.ok) load();
    }
  }
});

load();
