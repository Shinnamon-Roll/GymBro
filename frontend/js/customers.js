const API = window.API;

let currentPage = 1;
const limit = 10;
let totalPages = 1;

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
  const q = document.getElementById("search-input").value;
  const res = await fetch(`${API}/customers?page=${currentPage}&limit=${limit}&q=${encodeURIComponent(q)}`).then((r) => r.json());
  
  let data = [];
  if (Array.isArray(res)) {
      data = res;
  } else {
      data = res.data;
      totalPages = res.totalPages;
      currentPage = res.page;
  }

  tbody.innerHTML = "";
  if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="p-4 text-center text-secondary font-bold">No customers found</td></tr>`;
  } else {
      data.forEach((c) => tbody.appendChild(row(c)));
  }
  updatePaginationControls();
};

const updatePaginationControls = () => {
    document.getElementById("page-info").textContent = `Page ${currentPage} of ${totalPages || 1}`;
    document.getElementById("prev-page").disabled = currentPage <= 1;
    document.getElementById("next-page").disabled = currentPage >= totalPages;
};

window.searchCustomers = () => {
    currentPage = 1;
    load();
};

window.changePage = (delta) => {
    currentPage += delta;
    if (currentPage < 1) currentPage = 1;
    if (currentPage > totalPages) currentPage = totalPages;
    load();
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
  } else {
    const err = await r.json();
    if (err.errors) {
        alert(err.errors.map(e => e.msg).join('\n'));
    } else {
        alert(err.error || 'Failed to create customer');
    }
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
    try {
      // 1. Fetch current data
      const currentData = await fetch(`${API}/customers/${id}`).then(r => {
        if (!r.ok) throw new Error("Failed to fetch customer");
        return r.json();
      });

      // 2. Prompt with pre-filled values
      const name = prompt("ชื่อ", currentData.fullName || "");
      if (name === null) return; // User cancelled

      const email = prompt("อีเมล", currentData.email || "");
      if (email === null) return;

      const phone = prompt("โทรศัพท์", currentData.phone || "");
      if (phone === null) return;

      if (name && email) {
        const body = {
            ...currentData,
            fullName: name,
            email: email,
            phone: phone
        };
        const r = await fetch(`${API}/customers/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (r.ok) {
            load();
        } else {
            const err = await r.json();
            if (err.errors) {
                alert(err.errors.map(e => e.msg).join('\n'));
            } else {
                alert(err.error || 'Failed to update customer');
            }
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error fetching customer data");
    }
  }
});

load();
