(function () {
  async function request(method, url, body) {
    const opts = { method, credentials: 'include', headers: {} };
    if (body !== undefined) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(url, opts);
    let data = null;
    try {
      data = await res.json();
    } catch (err) {
      data = null;
    }
    if (!res.ok) {
      const message = (data && data.error) || `Something went wrong (${res.status}).`;
      const error = new Error(message);
      error.status = res.status;
      throw error;
    }
    return data;
  }

  async function upload(url, file) {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(url, { method: 'POST', credentials: 'include', body: formData });
    let data = null;
    try {
      data = await res.json();
    } catch (err) {
      data = null;
    }
    if (!res.ok) {
      throw new Error((data && data.error) || 'Upload failed.');
    }
    return data;
  }

  window.api = {
    get: (url) => request('GET', url),
    post: (url, body) => request('POST', url, body),
    put: (url, body) => request('PUT', url, body),
    del: (url) => request('DELETE', url),
    upload,
  };
})();
