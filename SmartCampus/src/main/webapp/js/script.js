// SmartCampus shared front-end logic. Talks to the servlet API (JSON) and
// renders whichever page it finds matching elements for.

const api = {
  async post(url, data) {
    const body = new URLSearchParams(data);
    const res = await fetch(url, { method: "POST", body });
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: json };
  },
  async get(url) {
    const res = await fetch(url);
    const json = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data: json };
  }
};

function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = "msg " + (type === "error" ? "msg-error" : "msg-success");
  el.style.display = "block";
}

function statusBadge(status) {
  const map = {
    "Pending": "badge-pending",
    "In Progress": "badge-inprogress",
    "Resolved": "badge-resolved",
    "Rejected": "badge-rejected"
  };
  return `<span class="badge ${map[status] || "badge-pending"}">${status}</span>`;
}

function priorityBadge(priority) {
  const map = { "High": "badge-high", "Medium": "badge-medium", "Low": "badge-low" };
  return `<span class="badge ${map[priority] || "badge-low"}">${priority}</span>`;
}

function imageThumb(imagePath) {
  if (!imagePath) return "";
  return `<a href="${imagePath}" target="_blank"><img class="complaint-thumb" src="${imagePath}" alt="complaint photo"></a>`;
}

// ---------- role guard: keeps students out of admin pages and vice versa ----------
async function enforceRole() {
  const required = document.body.getAttribute("data-role");
  if (!required) return;
  const { ok, data } = await api.get("api/profile");
  if (!ok) {
    window.location.href = "login.html";
    return;
  }
  if (data.role !== required) {
    window.location.href = data.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
  }
}

// ---------- login.html ----------
function initLoginPage() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register");
  const msg = document.getElementById("auth-msg");

  if (!loginForm) return;

  loginTab.addEventListener("click", () => {
    loginTab.classList.add("active");
    registerTab.classList.remove("active");
    loginForm.style.display = "block";
    registerForm.style.display = "none";
  });
  registerTab.addEventListener("click", () => {
    registerTab.classList.add("active");
    loginTab.classList.remove("active");
    registerForm.style.display = "block";
    loginForm.style.display = "none";
  });

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(loginForm);
    const { ok, data } = await api.post("api/login", {
      action: "login",
      email: fd.get("email"),
      password: fd.get("password")
    });
    if (ok && data.success) {
      window.location.href = data.role === "admin" ? "admin-dashboard.html" : "student-dashboard.html";
    } else {
      showMsg(msg, data.message || "Login failed", "error");
    }
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(registerForm);
    const { ok, data } = await api.post("api/login", {
      action: "register",
      name: fd.get("name"),
      email: fd.get("email"),
      password: fd.get("password"),
      department: fd.get("department"),
      phone: fd.get("phone")
    });
    if (ok && data.success) {
      showMsg(msg, "Registered! You can log in now.", "success");
      registerForm.reset();
      loginTab.click();
    } else {
      showMsg(msg, data.message || "Registration failed", "error");
    }
  });
}

// ---------- logout (any page with a #logout-link) ----------
function initLogout() {
  const el = document.getElementById("logout-link");
  if (!el) return;
  el.addEventListener("click", async (e) => {
    e.preventDefault();
    await api.post("api/logout", {});
    window.location.href = "login.html";
  });
}

// ---------- complaint.html ----------
function initComplaintPage() {
  const form = document.getElementById("complaint-form");
  if (!form) return;
  const msg = document.getElementById("complaint-msg");
  const dupBox = document.getElementById("duplicate-warning");
  const submitBtn = document.getElementById("complaint-submit-btn");

  async function submitComplaint(force) {
    const fd = new FormData(form);
    if (force) fd.set("force", "true");

    const res = await fetch("api/complaint", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      dupBox.style.display = "none";
      showMsg(msg, `Complaint #${data.id} submitted — priority: ${data.priority}`, "success");
      form.reset();
      return;
    }

    if (res.status === 409 && data.duplicate) {
      msg.style.display = "none";
      dupBox.style.display = "block";
      dupBox.innerHTML = `
        <div class="msg msg-error">
          ${data.message}
        </div>
        <div style="display:flex; gap:10px; margin-bottom:16px;">
          <a class="btn btn-secondary" href="complaint-details.html?id=${data.existingId}">View Complaint #${data.existingId}</a>
          <button type="button" id="submit-anyway-btn" class="btn">Submit Anyway</button>
        </div>
      `;
      document.getElementById("submit-anyway-btn").addEventListener("click", () => submitComplaint(true));
      return;
    }

    dupBox.style.display = "none";
    showMsg(msg, data.message || "Submission failed", "error");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    dupBox.style.display = "none";
    submitComplaint(false);
  });
}

// ---------- my-complaints.html ----------
async function initMyComplaintsPage() {
  const tbody = document.getElementById("my-complaints-body");
  if (!tbody) return;

  const { ok, data } = await api.get("api/my-complaints");
  if (!ok) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">Could not load complaints.</td></tr>`;
    return;
  }
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="7" class="empty-state">No complaints filed yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = data.map(c => `
    <tr>
      <td>#${c.id}</td>
      <td>${c.category}</td>
      <td>${c.location || "-"}</td>
      <td>${imageThumb(c.imagePath)}</td>
      <td>${priorityBadge(c.priority)}</td>
      <td>${statusBadge(c.status)}</td>
      <td><a class="btn btn-secondary" href="complaint-details.html?id=${c.id}">View</a></td>
    </tr>
  `).join("");
}

// ---------- track-complaint.html ----------
function initTrackPage() {
  const form = document.getElementById("track-form");
  if (!form) return;
  const result = document.getElementById("track-result");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = new FormData(form).get("id");
    const { ok, data } = await api.get(`api/track-complaint?id=${encodeURIComponent(id)}`);
    if (!ok) {
      result.innerHTML = `<div class="msg msg-error">${data.message || "Complaint not found"}</div>`;
      return;
    }
    result.innerHTML = `
      <div class="card">
        <h3>Complaint #${data.id}</h3>
        <p><strong>Category:</strong> ${data.category}</p>
        <p><strong>Location:</strong> ${data.location || "-"}</p>
        <p><strong>Description:</strong> ${data.description}</p>
        ${data.imagePath ? `<p>${imageThumb(data.imagePath)}</p>` : ""}
        <p><strong>Priority:</strong> ${priorityBadge(data.priority)}</p>
        <p><strong>Status:</strong> ${statusBadge(data.status)}</p>
        <p><strong>Filed:</strong> ${data.createdAt}</p>
      </div>
    `;
  });
}

// ---------- complaint-details.html ----------
async function initComplaintDetailsPage() {
  const container = document.getElementById("complaint-details");
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    container.innerHTML = `<div class="msg msg-error">No complaint id given.</div>`;
    return;
  }
  const { ok, data } = await api.get(`api/track-complaint?id=${encodeURIComponent(id)}`);
  if (!ok) {
    container.innerHTML = `<div class="msg msg-error">${data.message || "Complaint not found"}</div>`;
    return;
  }
  container.innerHTML = `
    <h2>Complaint #${data.id}</h2>
    <p><strong>Filed by:</strong> ${data.userName}</p>
    <p><strong>Category:</strong> ${data.category}</p>
    <p><strong>Location:</strong> ${data.location || "-"}</p>
    <p><strong>Description:</strong> ${data.description}</p>
    ${data.imagePath ? `<p>${imageThumb(data.imagePath)}</p>` : ""}
    <p><strong>Priority:</strong> ${priorityBadge(data.priority)}</p>
    <p><strong>Status:</strong> ${statusBadge(data.status)}</p>
    <p><strong>Filed on:</strong> ${data.createdAt}</p>
    <p><strong>Last updated:</strong> ${data.updatedAt}</p>
  `;
}

// ---------- profile.html ----------
async function initProfilePage() {
  const form = document.getElementById("profile-form");
  if (!form) return;
  const msg = document.getElementById("profile-msg");

  const { ok, data } = await api.get("api/profile");
  if (ok) {
    form.name.value = data.name || "";
    form.email.value = data.email || "";
    form.department.value = data.department || "";
    form.phone.value = data.phone || "";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const res = await api.post("api/profile", {
      name: fd.get("name"),
      department: fd.get("department"),
      phone: fd.get("phone")
    });
    if (res.ok && res.data.success) {
      showMsg(msg, "Profile updated", "success");
    } else {
      showMsg(msg, res.data.message || "Update failed", "error");
    }
  });
}

// ---------- admin-dashboard.html ----------
async function initAdminDashboard() {
  const statsEl = document.getElementById("admin-stats");
  if (!statsEl) return;
  const { ok, data } = await api.get("api/admin/complaints");
  if (!ok) {
    statsEl.innerHTML = `<div class="msg msg-error">${data.message || "Could not load dashboard"}</div>`;
    return;
  }
  const s = data.stats;
  statsEl.innerHTML = `
    <div class="stat-box"><div class="num">${s.total}</div><div class="label">Total</div></div>
    <div class="stat-box"><div class="num">${s.pending}</div><div class="label">Pending</div></div>
    <div class="stat-box"><div class="num">${s.inProgress}</div><div class="label">In Progress</div></div>
    <div class="stat-box"><div class="num">${s.resolved}</div><div class="label">Resolved</div></div>
    <div class="stat-box"><div class="num">${s.high}</div><div class="label">High Priority</div></div>
  `;
}

// ---------- admin-complaints.html ----------
async function initAdminComplaintsPage() {
  const tbody = document.getElementById("admin-complaints-body");
  if (!tbody) return;

  async function load() {
    const { ok, data } = await api.get("api/admin/complaints");
    if (!ok) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">${data.message || "Could not load complaints"}</td></tr>`;
      return;
    }
    const complaints = data.complaints;
    if (!complaints.length) {
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">No complaints yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td>#${c.id}</td>
        <td>${c.userName}</td>
        <td>${c.category}</td>
        <td>${imageThumb(c.imagePath)}</td>
        <td>${priorityBadge(c.priority)}</td>
        <td>${statusBadge(c.status)}</td>
        <td>
          <select data-id="${c.id}" class="status-select">
            ${["Pending", "In Progress", "Resolved", "Rejected"].map(st =>
              `<option value="${st}" ${st === c.status ? "selected" : ""}>${st}</option>`
            ).join("")}
          </select>
        </td>
        <td><a class="btn btn-secondary" href="complaint-details.html?id=${c.id}">View</a></td>
      </tr>
    `).join("");

    tbody.querySelectorAll(".status-select").forEach(sel => {
      sel.addEventListener("change", async () => {
        const id = sel.getAttribute("data-id");
        await api.post("api/admin/update-complaint", { id, status: sel.value });
        load();
      });
    });
  }

  load();
}

document.addEventListener("DOMContentLoaded", () => {
  enforceRole();
  initLoginPage();
  initLogout();
  initComplaintPage();
  initMyComplaintsPage();
  initTrackPage();
  initComplaintDetailsPage();
  initProfilePage();
  initAdminDashboard();
  initAdminComplaintsPage();
});
