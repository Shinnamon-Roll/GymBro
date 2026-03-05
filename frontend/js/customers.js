const API = window.API;

const tbody = document.getElementById("customers-table");
const form = document.getElementById("customer-form");
const nameEl = document.getElementById("name");
const emailEl = document.getElementById("email");
const phoneEl = document.getElementById("phone");
const memberTypeEl = document.getElementById("memberType");
const memberLevelEl = document.getElementById("memberLevel");
const memberStartDateEl = document.getElementById("memberStartDate");
const memberEndDateEl = document.getElementById("memberEndDate");

const row = (c) => {
  const tr = document.createElement("tr");
  tr.className = "hover:bg-contrast transition-colors border-b border-gray-100";
  const start = c.memberStartDate ? new Date(c.memberStartDate).toLocaleDateString() : "-";
  const end = c.memberEndDate ? new Date(c.memberEndDate).toLocaleDateString() : "-";
  
  tr.innerHTML = `
    <td class="p-4 font-bold text-primary">#${c.id}</td>
    <td class="p-4 font-bold">${c.fullName}</td>
    <td class="p-4 text-sm">
      <div class="font-semibold text-primary">${c.email}</div>
      <div class="text-xs text-secondary">${c.phone || "-"}</div>
    </td>
    <td class="p-4">
      <span class="bg-secondary text-white px-2 py-1 text-xs font-bold uppercase mr-1">${c.memberType}</span>
      <span class="bg-accent text-primary px-2 py-1 text-xs font-bold uppercase">${c.memberLevel}</span>
    </td>
    <td class="p-4 text-xs font-mono text-secondary">
      <div>Start: ${start}</div>
      <div>End: ${end}</div>
    </td>
    <td class="p-4 text-center">
      <div class="flex justify-center gap-2">
        <button data-id="${c.id}" data-action="edit" class="text-accent hover:text-primary transition-colors font-bold uppercase text-xs border-b-2 border-transparent hover:border-primary">Edit</button>
        <button data-id="${c.id}" data-action="delete" class="text-red-500 hover:text-red-700 transition-colors font-bold uppercase text-xs border-b-2 border-transparent hover:border-red-700">Delete</button>
      </div>
    </td>
  `;
  return tr;
};

const load = async () => {
  const data = await fetch(`${API}/customers`).then((r) => r.json());
  tbody.innerHTML = "";
  data.forEach((c) => tbody.appendChild(row(c)));
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const body = {
    fullName: nameEl.value.trim(),
    email: emailEl.value.trim(),
    phone: phoneEl.value.trim() || null,
    memberType: memberTypeEl.value,
    memberLevel: memberLevelEl.value,
    memberStartDate: memberStartDateEl.value,
    memberEndDate: memberEndDateEl.value || null,
  };
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
        body: JSON.stringify({ fullName: name, email, phone }),
      });
      if (r.ok) load();
    }
  }
});

load();
