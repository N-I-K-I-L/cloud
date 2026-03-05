window.App = (() => {
  function getAccess() { return localStorage.getItem('access_token'); }
  function getRefresh() { return localStorage.getItem('refresh_token'); }
  function setTokens(access, refresh) {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  }
  function clearTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  async function refreshAccessToken() {
    const refresh = getRefresh();
    if (!refresh) throw new Error('No refresh token');
    const res = await fetch('/api/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    localStorage.setItem('access_token', data.access);
    return data.access;
  }

  async function request(url, options = {}, retry = true) {
    const headers = Object.assign({}, options.headers || {});
    const access = getAccess();
    if (access && !headers.Authorization) headers.Authorization = `Bearer ${access}`;

    const res = await fetch(url, Object.assign({}, options, { headers }));
    if (res.status === 401 && retry && getRefresh()) {
      try {
        const newAccess = await refreshAccessToken();
        return request(url, Object.assign({}, options, {
          headers: Object.assign({}, options.headers || {}, { Authorization: `Bearer ${newAccess}` })
        }), false);
      } catch {
        clearTokens();
      }
    }

    const contentType = res.headers.get('content-type') || '';
    const payload = contentType.includes('application/json') ? await res.json() : await res.text();
    if (!res.ok) {
      const err = new Error('Request failed');
      err.payload = payload;
      throw err;
    }
    return payload;
  }

  async function get(url) { return request(url, { method: 'GET' }); }
  async function post(url, body, auth = true) {
    return request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(auth ? {} : { Authorization: '' }) },
      body: JSON.stringify(body),
    });
  }
  async function patch(url, body) {
    return request(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }
  async function upload(url, formData) {
    return request(url, {
      method: 'POST',
      body: formData,
    });
  }

  async function download(url, filename = 'download.zip') {
    const fetchWithToken = async (token) => {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      return fetch(url, { method: 'GET', headers });
    };

    let res = await fetchWithToken(getAccess());
    if (res.status === 401 && getRefresh()) {
      try {
        const newAccess = await refreshAccessToken();
        res = await fetchWithToken(newAccess);
      } catch {
        clearTokens();
      }
    }

    if (!res.ok) {
      const contentType = res.headers.get('content-type') || '';
      const payload = contentType.includes('application/json') ? await res.json() : await res.text();
      const err = new Error('Download failed');
      err.payload = payload;
      throw err;
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
  }

  function requireAuth() {
    if (!getAccess()) location.href = '/login/';
  }

  function updateNav() {
    const nav = document.getElementById('top-nav');
    if (!nav) return;
    if (getAccess()) {
      nav.innerHTML = '<a href="/dashboard/">Dashboard</a><button id="logout-btn" class="btn">Logout</button>';
      const logoutBtn = document.getElementById('logout-btn');
      logoutBtn?.addEventListener('click', () => {
        clearTokens();
        location.href = '/';
      });
    }
  }

  function errorMessage(err, fallback) {
    const p = err?.payload;
    if (!p) return fallback;
    if (typeof p === 'string') {
      // If backend returns an HTML error page, do not dump raw markup to users.
      if (p.includes('<html') || p.includes('<!DOCTYPE')) {
        return 'Server error. Check server logs and deployment environment variables.';
      }
      return p;
    }
    if (p.detail) return p.detail;
    return JSON.stringify(p);
  }

  return {
    get, post, patch, upload, download,
    getAccess, getRefresh, setTokens, clearTokens,
    requireAuth, updateNav, errorMessage,
  };
})();
