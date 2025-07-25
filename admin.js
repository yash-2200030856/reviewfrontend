const API = "http://localhost:5000";
const token = localStorage.getItem("adminToken");
if (!token) window.location.href = "login.html";

function logout() {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
}

async function fetchUsers() {
  const res = await fetch(`${API}/admin/users`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Failed to load users");
  const users = await res.json();
  const tbody = document.querySelector("#users-table tbody");
  tbody.innerHTML = "";
  users.forEach(u => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td><button onclick='deleteUser(${u.id})'>Delete</button></td>`;
    tbody.appendChild(tr);
  });
}

async function fetchReviews() {
  const res = await fetch(`${API}/admin/reviews`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Failed to load reviews");
  const reviews = await res.json();
  const tbody = document.querySelector("#reviews-table tbody");
  tbody.innerHTML = "";
  reviews.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.id}</td><td>${r.user_name}</td><td>${r.product_name}</td><td>${r.review}</td>`;
    tbody.appendChild(tr);
  });
}

async function deleteUser(id) {
  if (!confirm("Delete this user? This will remove their reviews/ratings too.")) return;
  const res = await fetch(`${API}/admin/users/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) return alert("Failed to delete user");
  fetchUsers();
  fetchReviews();
}

window.onload = function() {
  fetchUsers();
  fetchReviews();
};
