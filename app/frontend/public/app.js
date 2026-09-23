// API Base URL - In production behind Nginx/Ingress, calls go through relative '/api'
const API_BASE = '/api';

// Elements
const podHostname = document.getElementById('podHostname');
const platformInfo = document.getElementById('platformInfo');
const uptimeInfo = document.getElementById('uptimeInfo');
const envBadge = document.getElementById('envBadge');

const liveStatus = document.getElementById('liveStatus');
const readyStatus = document.getElementById('readyStatus');
const dbStatus = document.getElementById('dbStatus');
const redisStatus = document.getElementById('redisStatus');

const cacheStatusBox = document.getElementById('cacheStatusBox');
const cacheHitText = document.getElementById('cacheHitText');
const latencyValue = document.getElementById('latencyValue');
const fetchDataBtn = document.getElementById('fetchDataBtn');

const itemsTableBody = document.getElementById('itemsTableBody');
const addItemForm = document.getElementById('addItemForm');
const taskTitleInput = document.getElementById('taskTitleInput');

// 1. Fetch System & Pod Metadata
async function fetchSystemInfo() {
  try {
    const res = await fetch(`${API_BASE}/info`);
    if (!res.ok) throw new Error('Failed to load system info');
    const data = await res.json();

    podHostname.textContent = data.hostname || 'Unknown Pod';
    platformInfo.textContent = data.platform || 'Linux/Container';
    uptimeInfo.textContent = `${data.uptimeSeconds}s`;
    envBadge.textContent = data.environment || 'production';
  } catch (err) {
    podHostname.textContent = 'API Offline (retrying...)';
  }
}

// 2. Fetch Health & Probes
async function fetchHealthProbes() {
  try {
    const liveRes = await fetch(`${API_BASE}/live`);
    if (liveRes.ok) {
      liveStatus.textContent = 'ALIVE';
      liveStatus.className = 'status-pill status-up';
    } else {
      liveStatus.textContent = 'FAILING';
      liveStatus.className = 'status-pill status-down';
    }

    const readyRes = await fetch(`${API_BASE}/ready`);
    if (readyRes.ok) {
      const readyData = await readyRes.json();
      readyStatus.textContent = readyData.status || 'READY';
      readyStatus.className = 'status-pill status-up';

      if (readyData.checks) {
        dbStatus.textContent = readyData.checks.database || 'READY';
        redisStatus.textContent = readyData.checks.redis || 'DOWN';
      }
    }
  } catch (err) {
    liveStatus.textContent = 'UNREACHABLE';
    readyStatus.textContent = 'UNREACHABLE';
  }
}

// 3. Fetch Items & Measure Redis Cache Performance
async function fetchItems() {
  const startTime = performance.now();
  try {
    const res = await fetch(`${API_BASE}/items`);
    const elapsed = Math.round(performance.now() - startTime);
    latencyValue.textContent = `${elapsed} ms`;

    if (!res.ok) throw new Error('Failed to load items');
    const result = await res.json();

    // Cache visualization
    if (result.cached) {
      cacheStatusBox.className = 'cache-status-box cache-hit';
      cacheHitText.textContent = `⚡ CACHE HIT (Served in ${elapsed}ms via Redis)`;
    } else {
      cacheStatusBox.className = 'cache-status-box cache-miss';
      cacheHitText.textContent = `🐢 CACHE MISS (Loaded in ${elapsed}ms from DB & cached)`;
    }

    renderTable(result.data || []);
  } catch (err) {
    itemsTableBody.innerHTML = `<tr><td colspan="4" class="empty-state">Error connecting to microservice API</td></tr>`;
  }
}

// 4. Render Task Items
function renderTable(items) {
  if (items.length === 0) {
    itemsTableBody.innerHTML = `<tr><td colspan="4" class="empty-state">No tasks created yet.</td></tr>`;
    return;
  }

  itemsTableBody.innerHTML = items
    .map(
      (item) => `
      <tr>
        <td><strong>#${item.id}</strong></td>
        <td>${escapeHtml(item.title)}</td>
        <td><span class="status-pill status-ready">${escapeHtml(item.status || 'Active')}</span></td>
        <td>${item.createdAt ? new Date(item.createdAt).toLocaleTimeString() : 'Initial'}</td>
      </tr>
    `
    )
    .join('');
}

// 5. Add New Task Item
addItemForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = taskTitleInput.value.trim();
  if (!title) return;

  try {
    const res = await fetch(`${API_BASE}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, status: 'In Progress' })
    });

    if (res.ok) {
      taskTitleInput.value = '';
      await fetchItems(); // Refreshes and shows cache miss on immediate fetch
    }
  } catch (err) {
    alert('Failed to create task');
  }
});

// Helper for security (XSS prevention)
function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

// Event Listeners & Periodic Polling
fetchDataBtn.addEventListener('click', fetchItems);

// Initial Load
fetchSystemInfo();
fetchHealthProbes();
fetchItems();

// Auto poll every 5 seconds
setInterval(() => {
  fetchSystemInfo();
  fetchHealthProbes();
}, 5000);
