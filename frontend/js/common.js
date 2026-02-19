const API = "http://localhost:3000/api";
const st = document.getElementById("ff-status");
if (st) {
  st.textContent = "🟡 Checking...";
  fetch(`${API}/health`)
    .then((r) => {
      if (r.ok) {
        st.textContent = "🟢 System Online | Database Connected";
      } else {
        st.textContent = "🔴 System Offline | Database Unreachable";
      }
    })
    .catch(() => {
      st.textContent = "🔴 System Offline | Database Unreachable";
    });
}
