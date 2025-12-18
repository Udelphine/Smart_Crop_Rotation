const apiBase = '/api/v1';

function el(id) { return document.getElementById(id); }

function renderError(container, err) {
  const text = err && err.message ? err.message : String(err);
  container.innerHTML = `<div class="meta">Error: ${text}</div>`;
}

async function healthCheck() {
  const container = el('healthResult');
  container.innerHTML = 'Checking...';
  try {
    const res = await fetch(`${apiBase}/health`);
    const json = await res.json();
    if (!res.ok || json.status === 'fail' || json.success === false) {
      renderError(container, json.error || json || 'Service unhealthy');
      return;
    }
    container.innerHTML = `<div class="meta">${json.service} — <strong>${json.status}</strong></div><div>${json.timestamp}</div>`;
  } catch (err) {
    renderError(container, err);
  }
}

async function apiRoot() {
  const container = el('healthResult');
  container.innerHTML = 'Loading...';
  try {
    const res = await fetch(`${apiBase}`);
    const json = await res.json();
    container.innerHTML = `<div class="meta">${json.message}</div><div>Version: ${json.apiVersion}</div>`;
  } catch (err) {
    renderError(container, err);
  }
}

function makeCropCard(crop) {
  return `
    <div class="cropCard">
      <div class="cropTitle">${crop.name}</div>
      <div class="meta">Family: ${crop.family} • Nutrients: ${crop.nutrient_requirement} • Water: ${crop.water_requirement}</div>
      <div class="meta">Seasons: ${Array.isArray(crop.season)?crop.season.join(', '):crop.season} • Acidity: ${crop.acidity ?? 0} • Owner: ${crop.owner_email || 'public'}</div>
    </div>`;
}

async function listCrops() {
  const container = el('cropsContainer');
  container.innerHTML = 'Loading...';
  try {
    const current = localStorage.getItem('currentUser');
    const owner = current || '';
    const url = owner ? `${apiBase}/crops?owner=${encodeURIComponent(owner)}` : `${apiBase}/crops`;
    const res = await fetch(url);
    const json = await res.json();
    const data = json.data || json;
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="meta">No crops available</div>';
      return;
    }
    container.innerHTML = data.map(makeCropCard).join('');
  } catch (err) {
    renderError(container, err);
  }
}

async function register() {
  const email = el('identifier').value.trim();
  const password = el('password').value;
  const container = el('authResult');
  container.innerHTML = 'Registering...';
  try {
    const res = await fetch(`${apiBase}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) { renderError(container, json); return; }
    const user = json.data?.user || json.user || json;
    container.innerHTML = `<div>Registered: ${user.email || user}</div>`;
    localStorage.setItem('currentUser', user.email || '');
    el('currentUser').textContent = user.email || '(user)';
    // pre-fill owner field for crop creation
    el('newCropOwner').value = user.email || '';
  } catch (err) {
    renderError(container, err);
  }
}

async function login() {
  const email = el('identifier').value.trim();
  const password = el('password').value;
  const container = el('authResult');
  container.innerHTML = 'Logging in...';
  try {
    const res = await fetch(`${apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!res.ok) { renderError(container, json); return; }
    const user = json.data?.user || json.user || json;
    container.innerHTML = `<div>Welcome ${user.email || 'user'}</div>`;
    localStorage.setItem('currentUser', user.email || '');
    el('currentUser').textContent = user.email || '(user)';
    el('newCropOwner').value = user.email || '';
    // refresh list to show only user's crops
    listCrops();
  } catch (err) {
    renderError(container, err);
  }
}

async function getProfile() {
  const container = el('authResult');
  const current = localStorage.getItem('currentUser');
  if (!current) { container.innerHTML = '<div class="meta">Not logged in</div>'; return; }
  container.innerHTML = `<div><strong>${current}</strong></div>`;
}

function logout() {
  localStorage.removeItem('currentUser');
  el('currentUser').textContent = '(not logged in)';
  el('authResult').innerHTML = '';
  el('newCropOwner').value = '';
  listCrops();
}

async function createCrop() {
  const name = el('newCropName').value.trim();
  const family = el('newCropFamily').value.trim() || 'Other';
  const acidity = Number(el('newCropAcidity').value) || 0;
  const owner = el('newCropOwner').value.trim() || localStorage.getItem('currentUser') || null;
  const container = el('authResult');
  if (!name) return renderError(container, new Error('Name required'));
  try {
    const res = await fetch(`${apiBase}/crops`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, family, acidity, owner_email: owner }),
    });
    const j = await res.json();
    if (!res.ok) return renderError(container, j);
    container.innerHTML = `<div>Crop created: ${j.data?.name || name}</div>`;
    el('newCropName').value = '';
    el('newCropAcidity').value = '';
    // refresh list
    listCrops();
  } catch (err) { renderError(container, err); }
}

document.addEventListener('DOMContentLoaded', () => {
  el('healthBtn').addEventListener('click', healthCheck);
  el('apiRootBtn').addEventListener('click', apiRoot);
  el('listCropsBtn').addEventListener('click', listCrops);
  el('setSoilBtn').addEventListener('click', async () => {
    const v = el('soilHpInput').value || '50';
    try {
      const res = await fetch(`${apiBase}/soil`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ hp: v })
      });
      const j = await res.json();
      if (!res.ok) return renderError(el('healthResult'), j);
      el('healthResult').innerHTML = `<div class="meta">Soil HP set to ${j.data.hp}</div>`;
    } catch (err) { renderError(el('healthResult'), err); }
  });
  el('registerBtn').addEventListener('click', register);
  el('loginBtn').addEventListener('click', login);
  el('profileBtn').addEventListener('click', getProfile);
  el('logoutBtn').addEventListener('click', logout);
  el('createCropBtn').addEventListener('click', createCrop);
  // quick acidity check: clicking a crop card will prompt for acidity check
  document.addEventListener('click', async (ev) => {
    const target = ev.target.closest && ev.target.closest('.cropCard');
    if (!target) return;
    const name = target.querySelector('.cropTitle')?.textContent || 'crop';
    const acidity = prompt(`Enter acidity for ${name} (0-100)`);
    if (acidity === null) return;
    try {
      const res = await fetch(`${apiBase}/rotation/check?acidity=${encodeURIComponent(acidity)}`);
      const j = await res.json();
      if (!res.ok) return renderError(el('healthResult'), j);
      el('healthResult').innerHTML = `<div class="meta">Crop: ${name} — acidity: ${j.data.acidity} — soilHP: ${j.data.soilHP} — match: ${j.data.match}</div>`;
    } catch (err) { renderError(el('healthResult'), err); }
  });

  const current = localStorage.getItem('currentUser');
  if (current) el('currentUser').textContent = current;
  // initial load
  listCrops();
  healthCheck();
});
