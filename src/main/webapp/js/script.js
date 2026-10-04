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
  toast(text, type);
}

function toast(text, type) {
  let region = document.querySelector(".toast-region");
  if (!region) { region = document.createElement("div"); region.className = "toast-region"; region.setAttribute("aria-live", "polite"); document.body.appendChild(region); }
  const item = document.createElement("div"); item.className = "toast" + (type === "error" ? " error" : ""); item.textContent = text;
  region.appendChild(item); window.setTimeout(() => { item.classList.add("is-leaving"); window.setTimeout(() => item.remove(), 260); }, 3900);
}

function animateNumbers(root) {
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  (root || document).querySelectorAll(".stat-box .num").forEach(el => {
    const target = Number(el.textContent); if (!Number.isFinite(target)) return;
    const start = performance.now(), duration = 650;
    const tick = now => { const t = Math.min(1, (now - start) / duration); el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3))); if (t < 1) requestAnimationFrame(tick); };
    el.textContent = "0"; requestAnimationFrame(tick);
  });
}

function statIcon(kind) {
  const paths = {
    total: '<rect x="4" y="4" width="7" height="7" rx="1"/><rect x="13" y="4" width="7" height="7" rx="1"/><rect x="4" y="13" width="7" height="7" rx="1"/><rect x="13" y="13" width="7" height="7" rx="1"/>',
    pending: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
    progress: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    resolved: '<path d="m5 12 4.5 4.5L19 7"/>',
    priority: '<path d="M12 3 2.8 20h18.4L12 3Z"/><path d="M12 9v5M12 17h.01"/>'
  };
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${paths[kind] || paths.total}</svg>`;
}

function userInitials(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  return parts.length > 1 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : (parts[0] || "SC").slice(0, 2).toUpperCase();
}

function updateProfileSummary(data) {
  if (!data) return;
  const name = document.getElementById("profile-name-display");
  const email = document.getElementById("profile-email-display");
  const department = document.getElementById("profile-department-display");
  const role = document.getElementById("profile-role-display");
  const avatar = document.getElementById("profile-avatar");
  const navAvatar = document.querySelector(".avatar-small");
  if (name) name.textContent = data.name || "Student profile";
  if (email) email.textContent = data.email || "Your campus account";
  if (department) department.textContent = data.department || "Not provided";
  if (role) role.textContent = data.role === "admin" ? "Administrator" : "Student";
  if (avatar) avatar.textContent = userInitials(data.name);
  if (navAvatar) navAvatar.textContent = userInitials(data.name);
}

function initPasswordToggles() {
  document.querySelectorAll(".password-wrap").forEach(wrap => {
    const input = wrap.querySelector('input[type="password"]');
    const button = wrap.querySelector(".password-toggle");
    if (!input || !button) return;
    button.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      button.setAttribute("aria-label", show ? "Hide password" : "Show password");
      button.classList.toggle("is-visible", show);
    });
  });
}

function initNavigation() {
  const page = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".app-nav a[href]").forEach(link => {
    const target = link.getAttribute("href").split("?")[0];
    if (target === page || (page === "complaint-details.html" && (target === "my-complaints.html" || target === "admin-complaints.html"))) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });
}

function applyRoleNavigation(data) {
  if (!data) return;
  const nav = document.querySelector(".app-nav");
  const brand = document.querySelector(".navbar .brand");
  const account = document.querySelector(".account-link");
  if (data.role === "admin" && nav) {
    nav.innerHTML = `<a href="admin-dashboard.html"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg></span><span>Dashboard</span></a><a href="admin-complaints.html"><span class="nav-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M7 4h13v16H7zM4 7v14h13M10 9h7M10 13h7"/></svg></span><span>All Complaints</span></a>`;
    if (brand) brand.href = "admin-dashboard.html";
    if (account) account.href = "admin-dashboard.html";
  }
  initNavigation();
  const accountName = document.getElementById("account-name");
  if (accountName) accountName.textContent = data.role === "admin" ? "Admin" : (data.name || "My account");
  const avatar = document.querySelector(".avatar-small");
  if (avatar) avatar.textContent = data.role === "admin" ? "AD" : userInitials(data.name);
}

function statusBadge(status) {
  const map = {
    "Pending": "badge-pending",
    "In Progress": "badge-inprogress",
    "Resolved": "badge-resolved",
    "Rejected": "badge-rejected"
  };
  return `<span class="badge ${map[status] || "badge-pending"}"><i aria-hidden="true"></i>${status}</span>`;
}

function priorityBadge(priority) {
  const map = { "High": "badge-high", "Critical": "badge-critical", "Medium": "badge-medium", "Low": "badge-low" };
  return `<span class="badge ${map[priority] || "badge-low"}">${priority}</span>`;
}

function imageThumb(imagePath) {
  if (!imagePath) return "";
  return `<a href="${imagePath}" target="_blank" rel="noopener noreferrer"><img class="complaint-thumb" src="${imagePath}" alt="complaint photo"></a>`;
}

function gpsLocationMarkup(complaint) {
  if (complaint.latitude == null || complaint.longitude == null) {
    return `<span class="gps-not-provided">GPS location not provided</span>`;
  }
  const latitude = Number(complaint.latitude);
  const longitude = Number(complaint.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return `<span class="gps-not-provided">GPS location not provided</span>`;
  }
  const accuracy = complaint.locationAccuracy == null ? NaN : Number(complaint.locationAccuracy);
  const accuracyText = Number.isFinite(accuracy) && accuracy >= 0
    ? `Accuracy: ±${Math.round(accuracy)} m`
    : "Accuracy: not available";
  const latitudeText = latitude.toFixed(7);
  const longitudeText = longitude.toFixed(7);
  const encodedLatitude = encodeURIComponent(latitudeText);
  const encodedLongitude = encodeURIComponent(longitudeText);
  const mapUrl = `https://www.openstreetmap.org/?mlat=${encodedLatitude}&mlon=${encodedLongitude}#map=18/${encodedLatitude}/${encodedLongitude}`;
  return `<div class="gps-location"><span class="gps-coordinates">${latitudeText}, ${longitudeText}</span><span class="gps-accuracy">${accuracyText}</span><a class="gps-map-link" href="${mapUrl}" target="_blank" rel="noopener noreferrer">View on Map</a></div>`;
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
    return;
  }
  applyRoleNavigation(data);
  const greeting = document.getElementById("student-name");
  if (greeting) greeting.textContent = (data.name || "there").split(" ")[0];
  const accountName = document.getElementById("account-name");
  if (accountName) accountName.textContent = data.name || "My account";
  updateProfileSummary(data);
}

// ---------- login.html ----------
function initLoginPage() {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const showRegister = document.getElementById("show-register");
  const showLogin = document.getElementById("show-login");
  const loginSwitch = document.getElementById("login-switch");
  const registerSwitch = document.getElementById("register-switch");
  const heading = document.getElementById("auth-heading");
  const subtitle = document.getElementById("auth-subtitle");
  const msg = document.getElementById("auth-msg");
  if (!loginForm) return;
  function switchAuth(mode) {
    const registering = mode === "register";
    const outgoing = registering ? loginForm : registerForm;
    const incoming = registering ? registerForm : loginForm;
    outgoing.classList.add("form-exit");
    window.setTimeout(() => {
      outgoing.style.display = "none";
      outgoing.classList.remove("form-exit");
      incoming.style.display = "block";
      incoming.classList.remove("form-enter");
      void incoming.offsetWidth;
      incoming.classList.add("form-enter");
      loginSwitch.style.display = registering ? "none" : "block";
      registerSwitch.style.display = registering ? "block" : "none";
      heading.textContent = registering ? "Create your account" : "Welcome back";
      subtitle.textContent = registering ? "Join your campus community and get support." : "Sign in to continue to your campus portal.";
      msg.style.display = "none";
    }, 130);
  }
  showRegister.addEventListener("click", e => { e.preventDefault(); switchAuth("register"); });
  showLogin.addEventListener("click", e => { e.preventDefault(); switchAuth("login"); });

  document.querySelectorAll('input[type="password"]').forEach(input => input.addEventListener("input", () => { input.setCustomValidity(""); }));

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = loginForm.querySelector('[type="submit"]'); button.disabled = true; button.dataset.label = button.textContent; button.textContent = "Signing in...";
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
    button.disabled = false; button.textContent = button.dataset.label;
  });

  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const button = registerForm.querySelector('[type="submit"]'); button.disabled = true; button.dataset.label = button.textContent; button.textContent = "Creating account...";
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
      switchAuth("login");
    } else {
      showMsg(msg, data.message || "Registration failed", "error");
    }
    button.disabled = false; button.textContent = button.dataset.label;
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

  const category = form.elements.category, description = form.elements.description, hint = document.getElementById("priority-hint");
  function suggestPriority() {
    const text = `${category.value} ${description.value}`.toLowerCase();
    let suggestion = "Low";
    if (/fire|weapon|immediate|emergency|life.?threat|danger/.test(text)) suggestion = "Critical";
    else if (/shock|exposed wire|injur|security|severe|leak|flood/.test(text)) suggestion = "High";
    else if (/water|wi.?fi|broken|hygiene|mess|hostel/.test(text)) suggestion = "Medium";
    hint.innerHTML = `Suggested priority: <strong class="priority-${suggestion.toLowerCase()}">${suggestion}</strong> <span>(visual guidance only)</span>`;
    const copy = document.getElementById("priority-copy");
    if (copy) copy.innerHTML = `Based on the category and description, consider this a <strong>${suggestion.toLowerCase()}</strong> priority. The campus team makes the final assessment.`;
  }
  category.addEventListener("change", suggestPriority); description.addEventListener("input", suggestPriority);
  suggestPriority();

  const fileInput = document.getElementById("complaint-image");
  const uploadZone = document.getElementById("upload-zone");
  const uploadTitle = document.getElementById("upload-title");
  if (fileInput && uploadZone) {
    const setFileLabel = () => { uploadTitle.textContent = fileInput.files.length ? fileInput.files[0].name : "Upload a photo"; };
    fileInput.addEventListener("change", setFileLabel);
    uploadZone.addEventListener("dragover", e => { e.preventDefault(); uploadZone.classList.add("is-dragging"); });
    uploadZone.addEventListener("dragleave", () => uploadZone.classList.remove("is-dragging"));
    uploadZone.addEventListener("drop", e => {
      e.preventDefault(); uploadZone.classList.remove("is-dragging");
      if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; setFileLabel(); }
    });
  }

  const locationButton = document.getElementById("use-current-location");
  const locationStatus = document.getElementById("location-status");
  const locationMapCard = document.getElementById("location-map-card");
  const locationMap = document.getElementById("location-map");
  const locationCoordinates = document.getElementById("location-coordinates");
  const locationAccuracy = document.getElementById("location-accuracy");
  const locationLabel = locationButton?.querySelector("span");
  let detectedLocation = null;
  function setLocationStatus(message, state) {
    if (!locationStatus) return;
    locationStatus.textContent = message;
    locationStatus.className = `location-status is-${state}`;
    locationStatus.hidden = false;
  }
  function clearLocationPreview() {
    detectedLocation = null;
    if (locationMap) locationMap.removeAttribute("src");
    if (locationMapCard) locationMapCard.hidden = true;
    if (locationStatus) locationStatus.hidden = true;
    if (locationButton) { locationButton.disabled = false; locationButton.removeAttribute("aria-busy"); }
    if (locationLabel) locationLabel.textContent = "Use My Current Location";
  }
  if (locationButton) locationButton.addEventListener("click", () => {
    let geolocation;
    try { geolocation = navigator.geolocation; } catch (_) { geolocation = null; }
    if (!geolocation || typeof geolocation.getCurrentPosition !== "function") {
      setLocationStatus("Location detection is not supported by this browser. Please enter your location manually.", "error");
      return;
    }
    detectedLocation = null;
    if (locationMap) locationMap.removeAttribute("src");
    if (locationMapCard) locationMapCard.hidden = true;
    locationButton.disabled = true;
    locationButton.setAttribute("aria-busy", "true");
    if (locationLabel) locationLabel.textContent = "Detecting location...";
    setLocationStatus("Detecting location...", "loading");
    const restoreButton = () => {
      locationButton.disabled = false;
      locationButton.removeAttribute("aria-busy");
      if (locationLabel) locationLabel.textContent = "Use My Current Location";
    };
    try {
      geolocation.getCurrentPosition(position => {
        const { latitude, longitude, accuracy } = position.coords;
        if (![latitude, longitude, accuracy].every(Number.isFinite) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180 || accuracy < 0) {
          restoreButton();
          setLocationStatus("Unable to detect your location. Please enter it manually.", "error");
          return;
        }
        detectedLocation = { latitude, longitude, locationAccuracy: accuracy };
        const lat = latitude.toFixed(6), lon = longitude.toFixed(6), delta = 0.004;
        const bounds = [Math.max(-180, longitude - delta), Math.max(-90, latitude - delta), Math.min(180, longitude + delta), Math.min(90, latitude + delta)].map(value => value.toFixed(6)).join(",");
        const query = new URLSearchParams({ bbox: bounds, layer: "mapnik", marker: `${lat},${lon}` });
        locationMap.src = `https://www.openstreetmap.org/export/embed.html?${query.toString()}`;
        locationCoordinates.textContent = `${lat}, ${lon}`;
        locationAccuracy.textContent = `Accuracy: ${Math.round(accuracy)} m`;
        locationMapCard.hidden = false;
        restoreButton();
        setLocationStatus("\u2713 Current location detected", "success");
      }, error => {
        restoreButton();
        const message = error.code === 1
          ? "Location permission was denied. You can enter the location manually."
          : error.code === 2
            ? "Your location could not be determined. You can enter the location manually."
            : error.code === 3
              ? "Location detection timed out. Please try again or enter the location manually."
              : "Unable to detect your location. Please enter it manually.";
        setLocationStatus(message, "error");
      }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
    } catch (_) {
      restoreButton();
      setLocationStatus("Unable to detect your location. Please enter it manually.", "error");
    }
  });

  async function submitComplaint(force) {
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Submitting…"; }
    const fd = new FormData(form);
    if (force) fd.set("force", "true");
    if (detectedLocation) {
      fd.append("latitude", String(detectedLocation.latitude));
      fd.append("longitude", String(detectedLocation.longitude));
      fd.append("locationAccuracy", String(detectedLocation.locationAccuracy));
    }

    const res = await fetch("api/complaint", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.success) {
      dupBox.style.display = "none";
      showMsg(msg, `Complaint #${data.id} submitted — priority: ${data.priority}`, "success");
      form.reset();
      clearLocationPreview();
      if (uploadTitle) uploadTitle.textContent = "Upload a photo";
      document.getElementById("complaint-card")?.classList.add("submission-success");
      suggestPriority();
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Complaint"; }
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
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Complaint"; }
      return;
    }

    dupBox.style.display = "none";
    showMsg(msg, data.message || "Submission failed", "error");
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Submit Complaint"; }
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
      tbody.innerHTML = `<tr><td colspan="8" class="empty-state">Could not load complaints.</td></tr>`;
    return;
  }
  const stats = document.getElementById("my-complaint-stats");
  if (stats) {
    const count = status => data.filter(c => c.status === status).length;
    stats.innerHTML = [[data.length,"Total requests","stat-indigo","total"],[count("Pending"),"Pending","stat-amber","pending"],[count("In Progress"),"In progress","stat-cyan","progress"],[count("Resolved"),"Resolved","stat-green","resolved"]].map(([n,label,color,icon]) => `<div class="stat-box ${color}"><span class="stat-icon">${statIcon(icon)}</span><div class="num">${n}</div><div class="label">${label}</div></div>`).join("");
    animateNumbers(stats);
  }
  if (!data.length) {
    tbody.innerHTML = `<tr><td colspan="8"><div class="empty-state"><span class="empty-icon">&#9711;</span><h3>No complaints yet</h3><p>Your campus requests will appear here after you submit one.</p><a class="btn btn-primary" href="complaint.html">Create a complaint</a></div></td></tr>`;
    return;
  }
  const render = list => { tbody.innerHTML = list.length ? list.map(c => `
    <tr>
      <td>#${c.id}</td>
      <td>${c.category}</td>
      <td>${c.location || "-"}</td>
      <td>${c.createdAt || "-"}</td>
      <td>${imageThumb(c.imagePath)}</td>
      <td>${priorityBadge(c.priority)}</td>
      <td>${statusBadge(c.status)}</td>
      <td><a class="btn btn-secondary" href="complaint-details.html?id=${c.id}">View</a></td>
    </tr>
  `).join("") : `<tr><td colspan="8" class="empty-state">No matching complaints. Try another filter.</td></tr>`; };
  render(data);
  const search = document.getElementById("complaint-search"), filter = document.getElementById("complaint-filter");
  const apply = () => { const q = (search.value || "").toLowerCase(), status = filter.value; render(data.filter(c => (!status || c.status === status) && (!q || [c.id,c.category,c.location,c.description].some(v => String(v || "").toLowerCase().includes(q))))); };
  search.addEventListener("input", apply); filter.addEventListener("change", apply);
}

// ---------- track-complaint.html ----------
function initTrackPage() {
  const form = document.getElementById("track-form");
  if (!form) return;
  const result = document.getElementById("track-result");
  const layout = document.getElementById("track-layout");
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = new FormData(form).get("id");
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    layout.classList.add("has-result");
    result.innerHTML = '<section class="card result-loading"><div class="skeleton skeleton-line"></div><h2>Looking up your complaint...</h2><p>Getting the latest status.</p></section>';
    const { ok, data } = await api.get(`api/track-complaint?id=${encodeURIComponent(id)}`);
    button.disabled = false;
    if (!ok) {
      const message = data.message || "We couldn't find a complaint with that ID.";
      result.innerHTML = `<section class="card tracking-error"><span class="error-mark" aria-hidden="true">!</span><span class="eyebrow">REQUEST NOT FOUND</span><h2>We couldn't find that complaint</h2><p>${message}</p><a class="btn btn-secondary" href="#track-id">Check the ID and try again</a></section>`;
      toast(message, "error");
      return;
    }
    const response = data.adminResponse || data.response;
    result.innerHTML = `
      <article class="card track-ticket">
        <header class="ticket-header"><div><span class="eyebrow">COMPLAINT TRACKING</span><h2>Complaint #${data.id}</h2><p>Submitted ${data.createdAt || "date unavailable"}</p></div><div class="ticket-state">${statusBadge(data.status)}</div></header>
        <div class="ticket-facts"><div><span>Category</span><strong>${data.category || "-"}</strong></div><div><span>Priority</span><strong>${priorityBadge(data.priority)}</strong></div><div><span>Location</span><strong>${data.location || "Not provided"}</strong></div><div><span>Current status</span><strong>${statusBadge(data.status)}</strong></div></div>
        <section class="ticket-description"><span class="eyebrow">ISSUE DESCRIPTION</span><p>${data.description || "No description provided."}</p></section>
        <section class="ticket-timeline"><span class="eyebrow">PROGRESS</span>${timelineMarkup(data.status)}</section>
        ${data.imagePath ? `<section class="ticket-attachment"><span class="eyebrow">ATTACHMENT</span>${imageThumb(data.imagePath)}</section>` : ""}
        ${response ? `<section class="ticket-response"><span class="eyebrow">LATEST RESPONSE</span><p>${response}</p></section>` : ""}
      </article>`;
  });
}

function timelineMarkup(status) {
  const stages = ["Submitted", "Reviewed", "Assigned", "In Progress", "Resolved"];
  const current = status === "Pending" ? 0 : status === "In Progress" ? 3 : status === "Resolved" ? 4 : status === "Rejected" ? 1 : 0;
  return `<ol class="timeline" aria-label="Complaint status timeline">${stages.map((stage, i) => `<li class="timeline-step ${i <= current ? "done" : ""}" ${i === current ? 'aria-current="step"' : ""}><span class="timeline-node" aria-hidden="true"></span><span>${stage}</span></li>`).join("")}</ol>`;
}

async function initStudentDashboard() {
  const stats = document.getElementById("student-stats"); if (!stats) return;
  const { ok, data } = await api.get("api/my-complaints");
  if (!ok || !Array.isArray(data)) { stats.innerHTML = '<div class="msg msg-error">Could not load your complaint overview.</div>'; return; }
  const total = data.length, pending = data.filter(c => c.status === "Pending").length, progress = data.filter(c => c.status === "In Progress").length, resolved = data.filter(c => c.status === "Resolved").length;
  stats.innerHTML = [[total,"Total complaints","stat-indigo","total"],[pending,"Pending","stat-amber","pending"],[progress,"In progress","stat-cyan","progress"],[resolved,"Resolved","stat-green","resolved"]].map(([n,label,color,icon]) => `<div class="stat-box ${color}"><span class="stat-icon">${statIcon(icon)}</span><div class="num">${n}</div><div class="label">${label}</div></div>`).join(""); animateNumbers(stats);
  const recent = document.getElementById("recent-complaints");
  recent.innerHTML = `<div class="list-heading"><div><span class="eyebrow">RECENT ACTIVITY</span><h2>Recent complaints</h2></div><a class="text-link" href="my-complaints.html">View all <span aria-hidden="true">&#8594;</span></a></div>${data.length ? `<div class="table-wrap"><table><thead><tr><th>Request</th><th>Date submitted</th><th>Priority</th><th>Status</th><th></th></tr></thead><tbody>${data.slice(0,5).map(c=>`<tr><td><strong>#${c.id}</strong><span class="table-secondary">${c.category}</span></td><td>${c.createdAt || "-"}</td><td>${priorityBadge(c.priority)}</td><td>${statusBadge(c.status)}</td><td><a class="btn btn-tertiary" href="complaint-details.html?id=${c.id}">Details <span aria-hidden="true">&#8594;</span></a></td></tr>`).join("")}</tbody></table></div>` : `<div class="empty-state"><span class="empty-icon">&#9711;</span><h3>No complaints yet</h3><p>When you report an issue, its progress will appear here.</p><a class="btn btn-primary" href="complaint.html">File your first complaint</a></div>`}`;
}

// ---------- complaint-details.html ----------
async function initComplaintDetailsPage() {
  const container = document.getElementById("complaint-details");
  if (!container) return;
  api.get("api/profile").then(({ ok, data }) => { if (ok) applyRoleNavigation(data); });
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) {
    container.innerHTML = `<div class="msg msg-error">No complaint ID was provided.</div>`;
    return;
  }
  const { ok, data } = await api.get(`api/track-complaint?id=${encodeURIComponent(id)}`);
  if (!ok) {
    container.innerHTML = `<div class="tracking-error"><span class="error-mark">!</span><h2>Complaint not found</h2><p>${data.message || "Check the complaint ID and try again."}</p><a class="btn btn-secondary" href="my-complaints.html">Back to My Complaints</a></div>`;
    return;
  }
  const response = data.adminResponse || data.response;
  container.innerHTML = `
    <header class="ticket-header"><div><span class="eyebrow">SUPPORT TICKET</span><h2>Complaint #${data.id}</h2><p>Filed by ${data.userName || "student"} on ${data.createdAt || "date unavailable"}</p></div><div class="ticket-state">${statusBadge(data.status)}</div></header>
    <div class="ticket-facts"><div><span>Category</span><strong>${data.category || "-"}</strong></div><div><span>Priority</span><strong>${priorityBadge(data.priority)}</strong></div><div><span>Current status</span><strong>${statusBadge(data.status)}</strong></div><div><span>Location</span><strong>${data.location || "Not provided"}</strong></div></div>
    <section class="ticket-gps-location"><span class="eyebrow">GPS LOCATION</span>${gpsLocationMarkup(data)}</section>
    <section class="ticket-description"><span class="eyebrow">DESCRIPTION</span><p>${data.description || "No description provided."}</p></section>
    <section class="ticket-timeline"><span class="eyebrow">STATUS TIMELINE</span>${timelineMarkup(data.status)}</section>
    ${data.imagePath ? `<section class="ticket-attachment"><span class="eyebrow">ATTACHMENT</span>${imageThumb(data.imagePath)}</section>` : ""}
    ${response ? `<section class="ticket-response"><span class="eyebrow">LATEST RESPONSE</span><p>${response}</p></section>` : ""}
    <p class="ticket-updated">Last updated: ${data.updatedAt || data.createdAt || "-"}</p>
  `;
}

// ---------- profile.html ----------
async function initProfilePage() {
  const form = document.getElementById("profile-form");
  if (!form) return;
  const msg = document.getElementById("profile-msg");

  const { ok, data } = await api.get("api/profile");
  if (ok) {
    form.elements.namedItem("name").value = data.name || "";
    form.elements.namedItem("email").value = data.email || "";
    form.elements.namedItem("department").value = data.department || "";
    form.elements.namedItem("phone").value = data.phone || "";
    updateProfileSummary(data);
    applyRoleNavigation(data);
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
      const displayName = document.getElementById("profile-name-display"); if (displayName) displayName.textContent = fd.get("name") || "Student profile";
      const accountName = document.getElementById("account-name"); if (accountName) accountName.textContent = fd.get("name") || "My account";
      const initials = userInitials(fd.get("name"));
      const avatar = document.getElementById("profile-avatar"); if (avatar) avatar.textContent = initials;
      const navAvatar = document.querySelector(".avatar-small"); if (navAvatar) navAvatar.textContent = initials;
      const department = document.getElementById("profile-department-display"); if (department) department.textContent = fd.get("department") || "Not provided";
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
    ["admin-priority-list", "admin-status-overview", "admin-category-overview", "admin-insights"].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.innerHTML = `<p class="admin-data-error">Dashboard data is unavailable. Refresh to try again.</p>`;
    });
    return;
  }
  const complaints = Array.isArray(data.complaints) ? data.complaints : [];
  const countStatus = status => complaints.filter(c => String(c.status || "").toLowerCase() === status.toLowerCase()).length;
  const total = complaints.length;
  const pending = countStatus("Pending");
  const inProgress = countStatus("In Progress");
  const resolved = countStatus("Resolved");
  const high = complaints.filter(c => ["high", "critical"].includes(String(c.priority || "").toLowerCase())).length;
  statsEl.innerHTML = `
    <div class="stat-box stat-indigo"><span class="stat-icon">${statIcon("total")}</span><div class="num">${total}</div><div class="label">Total Complaints</div><small>All submitted requests</small></div>
    <div class="stat-box stat-amber"><span class="stat-icon">${statIcon("pending")}</span><div class="num">${pending}</div><div class="label">Pending</div><small>Awaiting review</small></div>
    <div class="stat-box stat-cyan"><span class="stat-icon">${statIcon("progress")}</span><div class="num">${inProgress}</div><div class="label">In Progress</div><small>Currently being handled</small></div>
    <div class="stat-box stat-green"><span class="stat-icon">${statIcon("resolved")}</span><div class="num">${resolved}</div><div class="label">Resolved</div><small>Successfully closed</small></div>
    <div class="stat-box stat-purple"><span class="stat-icon">${statIcon("priority")}</span><div class="num">${high}</div><div class="label">High Priority</div><small>Needs attention</small></div>
  `;
  animateNumbers(statsEl);
  const esc = value => String(value == null ? "" : value).replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
  const priorityRequests = complaints.filter(c => {
    const priority = String(c.priority || "").toLowerCase();
    const status = String(c.status || "").toLowerCase();
    const created = Date.parse(c.createdAt || "");
    const longRunning = Number.isFinite(created) && Date.now() - created > 7 * 86400000 && !["resolved", "rejected"].includes(status);
    return ["high", "critical"].includes(priority) || status === "pending" || longRunning;
  }).slice(0, 5);
  const priorityList = document.getElementById("admin-priority-list");
  if (priorityList) priorityList.innerHTML = priorityRequests.length ? priorityRequests.map(c => `<article class="priority-request"><div class="priority-request-main"><strong class="request-id">#${esc(c.id)}</strong><span class="request-category">${esc(c.category || "Uncategorized")}</span></div><div class="priority-request-meta">${priorityBadge(esc(c.priority || "Standard"))}${statusBadge(esc(c.status || "Unknown"))}<time>${esc(c.createdAt || "Date unavailable")}</time></div><a class="priority-detail-link" href="complaint-details.html?id=${encodeURIComponent(c.id)}">View details <span aria-hidden="true">→</span></a></article>`).join("") : `<div class="admin-empty-state"><span class="empty-check" aria-hidden="true">✓</span><div><strong>All caught up</strong><p>No urgent requests need attention right now.</p></div></div>`;

  const statusOverview = document.getElementById("admin-status-overview");
  const statusRows = [["Pending", pending, "status-pending"], ["In Progress", inProgress, "status-progress"], ["Resolved", resolved, "status-resolved"]];
  if (statusOverview) statusOverview.innerHTML = total ? `<div class="status-segmented" role="img" aria-label="${pending} pending, ${inProgress} in progress, ${resolved} resolved">${statusRows.map(([, count, cls]) => `<span class="${cls}" style="width:${count / total * 100}%"></span>`).join("")}</div><div class="status-legend">${statusRows.map(([label, count, cls]) => `<div class="status-legend-item"><span class="legend-dot ${cls}"></span><span>${label}</span><strong>${count}</strong><small>${Math.round(count / total * 100)}%</small></div>`).join("")}</div><p class="chart-footnote">${total} total ${total === 1 ? "request" : "requests"}</p>` : `<div class="admin-chart-empty">No complaint status data yet.</div>`;

  const categoryOverview = document.getElementById("admin-category-overview");
  const categories = new Map();
  complaints.forEach(c => { const name = String(c.category || "Uncategorized").trim() || "Uncategorized"; categories.set(name, (categories.get(name) || 0) + 1); });
  const orderedCategories = [...categories.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  if (categoryOverview) categoryOverview.innerHTML = orderedCategories.length ? orderedCategories.map(([name, count], index) => `<div class="category-row"><div class="category-row-label"><span>${esc(name)}</span><strong>${count}</strong></div><div class="category-track"><span class="category-fill category-color-${index % 5}" style="width:${count / total * 100}%"></span></div></div>`).join("") : `<div class="admin-chart-empty">Category insights will appear when requests arrive.</div>`;

  const insights = document.getElementById("admin-insights");
  if (insights) {
    const items = [];
    if (pending > 0) items.push(["insight-amber", statIcon("pending"), `${pending} ${pending === 1 ? "complaint is" : "complaints are"} awaiting review.`]);
    if (high > 0) items.push(["insight-red", statIcon("priority"), `${high} high-priority ${high === 1 ? "request needs" : "requests need"} attention.`]);
    if (orderedCategories.length) items.push(["insight-purple", statIcon("total"), `Most reported category: ${orderedCategories[0][0]} (${orderedCategories[0][1]}).`]);
    if (total > 0) items.push(["insight-green", statIcon("resolved"), `${Math.round(resolved / total * 100)}% of complaints are resolved.`]);
    insights.innerHTML = items.length ? items.map(([cls, icon, message]) => `<div class="insight-item ${cls}"><span class="insight-icon">${icon}</span><p>${esc(message)}</p></div>`).join("") : `<div class="admin-chart-empty">Insights will appear as campus requests are submitted.</div>`;
  }

  const loadedAt = new Date();
  const timeLabel = loadedAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const updated = document.getElementById("admin-updated");
  if (updated) { updated.dateTime = loadedAt.toISOString(); updated.textContent = `Updated ${timeLabel}`; }
  const activityTime = document.getElementById("activity-loaded-at");
  if (activityTime) activityTime.textContent = `Current complaint data retrieved at ${timeLabel}.`;
  const jump = document.getElementById("dashboard-priority-action");
  if (jump) jump.addEventListener("click", () => document.getElementById("priority-requests").scrollIntoView({ behavior: "smooth", block: "center" }));
  const refresh = document.getElementById("dashboard-refresh-action");
  if (refresh) refresh.addEventListener("click", () => window.location.reload());
}

// ---------- admin-complaints.html ----------
async function initAdminComplaintsPage() {
  const tbody = document.getElementById("admin-complaints-body");
  if (!tbody) return;

  async function load() {
    const { ok, data } = await api.get("api/admin/complaints");
    if (!ok) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">${data.message || "Could not load complaints"}</td></tr>`;
      return;
    }
    const complaints = data.complaints;
    if (!complaints.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-state">No complaints yet.</td></tr>`;
      return;
    }
    tbody.innerHTML = complaints.map(c => `
      <tr>
        <td>#${c.id}</td>
        <td>${c.userName}</td>
        <td>${c.category}</td>
        <td>${imageThumb(c.imagePath)}</td>
        <td>${gpsLocationMarkup(c)}</td>
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
  initNavigation();
  initPasswordToggles();
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
  initStudentDashboard();
  animateNumbers(document);
});
