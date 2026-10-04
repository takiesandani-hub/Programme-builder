const crypto = require('crypto');
const session = require('express-session');
const { getNetlifyStore } = require('./blob-store');

class NetlifySessionStore extends session.Store {
  constructor() {
    super();
    this.store = getNetlifyStore('scanprogram-sessions');
  }

  key(sessionId) {
    return crypto.createHash('sha256').update(sessionId).digest('hex');
  }

  get(sessionId, callback) {
    this.store
      .then((store) => store.get(this.key(sessionId), { type: 'json', consistency: 'strong' }))
      .then((data) => {
        if (data && data.expiresAt && data.expiresAt <= Date.now()) {
          return this.store.then((store) => store.delete(this.key(sessionId)))
            .then(() => callback(null, null));
        }
        callback(null, data?.session || null);
      })
      .catch(callback);
  }

  set(sessionId, sessionData, callback = () => {}) {
    const expiresAt = sessionData.cookie?.expires
      ? new Date(sessionData.cookie.expires).getTime()
      : Date.now() + 7 * 24 * 60 * 60 * 1000;
    this.store
      .then((store) => store.setJSON(this.key(sessionId), { expiresAt, session: sessionData }))
      .then(() => callback(null))
      .catch(callback);
  }

  destroy(sessionId, callback = () => {}) {
    this.store
      .then((store) => store.delete(this.key(sessionId)))
      .then(() => callback(null))
      .catch(callback);
  }

  touch(sessionId, sessionData, callback = () => {}) {
    this.set(sessionId, sessionData, callback);
  }
}

module.exports = NetlifySessionStore;
