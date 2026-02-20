const API = window.API || "http://localhost:3000/api";

const tbody = document.getElementById("customers-table");
const form = document.getElementById("customer-form");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");

const row = (c) => {
  const tr = document.createElement("tr");
  tr.innerHTML = `<td>${c.id}</td><td>${c.name}</td><td>${c.email}</td><td>${c.phone || ""}</td>
  <td class="actions">
    <button data-id="${c.id}" data-action="edit">แก้ไข</button>
    <button class="secondary" data-id="${c.id}" data-action="delete">ลบ</button>
  </td>`;
  return tr;
};

const load = async () => {
  const data = await fetch(`${API}/customers`).then((r) => r.json());
  tbody.innerHTML = "";
  data.forEach((c) => tbody.appendChild(row(c)));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = { name: nameEl.value.trim(), email: emailEl.value.trim(), phone: phoneEl.value.trim() || null };
  const r = await fetch(`${API}/customers`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
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
    const r = await fetch(`${API}/customers/${id}`, { method: "DELETE" });
    if (r.ok) load();
  }
  if (action === "edit") {
    const name = prompt("ชื่อ", "");
    const email = prompt("อีเมล", "");
    const phone = prompt("โทรศัพท์", "");
    if (name && email) {
      const r = await fetch(`${API}/customers/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone }),
      });
      if (r.ok) load();
    }
  }
});

load();
