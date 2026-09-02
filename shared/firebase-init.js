/**
 * Dual-Transport Firestore & Firebase Auth Service (shared/firebase-init.js)
 * 
 * Capability:
 * 1. Transport A (SDK Mode): Uses Firebase Compat SDK if loaded and initialized.
 * 2. Transport B (REST Fallback Mode): Falls back transparently to Firestore REST API v1
 *    (e.g., when blocked by adblockers, privacy extensions, strict firewalls, or SDK script failure).
 * 3. Bidirectional Data Normalization:
 *    - Automatically parses Firestore REST typing (stringValue, integerValue, mapValue, arrayValue, etc.)
 *      into clean standard JavaScript JSON objects with Document IDs.
 *    - Encodes JavaScript objects into Firestore REST fields format for write requests.
 */

(function() {
  // Ensure config is available
  function getConfig() {
    if (typeof window.firebaseConfig !== 'undefined' && window.firebaseConfig.projectId) {
      return window.firebaseConfig;
    }
    return {
      apiKey: "",
      projectId: "e-book-7c31a",
      authDomain: "e-book-7c31a.firebaseapp.com"
    };
  }

  // ----------------------------------------------------
  // FIRESTORE REST FORMAT NORMALIZER (Bidirectional)
  // ----------------------------------------------------
  const FirestoreParser = {
    /**
     * Decode Firestore REST document or field into clean JavaScript value
     */
    decodeValue(valObj) {
      if (!valObj || typeof valObj !== 'object') return valObj;

      if ('stringValue' in valObj) return valObj.stringValue;
      if ('integerValue' in valObj) return parseInt(valObj.integerValue, 10);
      if ('doubleValue' in valObj) return parseFloat(valObj.doubleValue);
      if ('booleanValue' in valObj) return Boolean(valObj.booleanValue);
      if ('timestampValue' in valObj) return valObj.timestampValue;
      if ('nullValue' in valObj) return null;
      if ('bytesValue' in valObj) return valObj.bytesValue;
      if ('referenceValue' in valObj) return valObj.referenceValue;
      if ('geoPointValue' in valObj) return valObj.geoPointValue;

      if ('mapValue' in valObj) {
        const fields = valObj.mapValue.fields || {};
        const res = {};
        for (const [key, fieldVal] of Object.entries(fields)) {
          res[key] = FirestoreParser.decodeValue(fieldVal);
        }
        return res;
      }

      if ('arrayValue' in valObj) {
        const values = valObj.arrayValue.values || [];
        return values.map(FirestoreParser.decodeValue);
      }

      return valObj;
    },

    /**
     * Decode a full Firestore REST Document resource
     * { name: "projects/.../documents/books/xyz", fields: { ... }, createTime, updateTime }
     */
    decodeDocument(docResource) {
      if (!docResource) return null;
      const result = {};

      // Extract document ID from resource name
      if (docResource.name) {
        const parts = docResource.name.split('/');
        result.id = parts[parts.length - 1];
      }

      if (docResource.createTime) result._createTime = docResource.createTime;
      if (docResource.updateTime) result._updateTime = docResource.updateTime;

      if (docResource.fields) {
        for (const [key, valObj] of Object.entries(docResource.fields)) {
          result[key] = FirestoreParser.decodeValue(valObj);
        }
      }

      return result;
    },

    /**
     * Encode standard JavaScript value to Firestore REST field format
     */
    encodeValue(val) {
      if (val === null || val === undefined) return { nullValue: null };
      if (typeof val === 'string') return { stringValue: val };
      if (typeof val === 'boolean') return { booleanValue: val };
      if (typeof val === 'number') {
        if (Number.isInteger(val)) return { integerValue: String(val) };
        return { doubleValue: val };
      }
      if (val instanceof Date) return { timestampValue: val.toISOString() };

      if (Array.isArray(val)) {
        return {
          arrayValue: {
            values: val.map(FirestoreParser.encodeValue)
          }
        };
      }

      if (typeof val === 'object') {
        const fields = {};
        for (const [k, v] of Object.entries(val)) {
          // Omit internal meta fields
          if (k !== 'id' && !k.startsWith('_')) {
            fields[k] = FirestoreParser.encodeValue(v);
          }
        }
        return { mapValue: { fields } };
      }

      return { stringValue: String(val) };
    },

    /**
     * Encode standard JavaScript object to Firestore REST fields map
     */
    encodeDocumentFields(jsObj) {
      const fields = {};
      for (const [key, val] of Object.entries(jsObj)) {
        if (key !== 'id' && !key.startsWith('_')) {
          fields[key] = FirestoreParser.encodeValue(val);
        }
      }
      return { fields };
    }
  };

  // ----------------------------------------------------
  // UNIFIED DUAL-TRANSPORT SERVICE (AppFirebase)
  // ----------------------------------------------------
  const AppFirebase = {
    _authListeners: [],
    _cachedUser: null,

    /**
     * Inspect active transport state
     */
    getTransportMode() {
      if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0 && firebase.firestore) {
        return 'SDK';
      }
      return 'REST';
    },

    getProjectId() {
      const cfg = getConfig();
      return cfg.projectId || 'e-book-7c31a';
    },

    getApiKey() {
      const cfg = getConfig();
      return cfg.apiKey || '';
    },

    getRestBaseUrl() {
      return `https://firestore.googleapis.com/v1/projects/${this.getProjectId()}/databases/(default)/documents`;
    },

    // --------------------------------------------------
    // CRUD: READ COLLECTION
    // --------------------------------------------------
    async getCollection(collectionName, options = {}) {
      const mode = this.getTransportMode();
      console.log(`[AppFirebase] Fetching collection '${collectionName}' via [${mode}]`);

      // 1. Try SDK Mode
      if (mode === 'SDK') {
        try {
          const db = firebase.firestore();
          let ref = db.collection(collectionName);
          if (options.orderByField) {
            ref = ref.orderBy(options.orderByField, options.orderDirection || 'asc');
          }
          if (options.limit) {
            ref = ref.limit(options.limit);
          }
          const snapshot = await ref.get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (sdkErr) {
          console.warn(`[AppFirebase] SDK collection fetch failed for '${collectionName}'. Switching to REST fallback:`, sdkErr.message);
        }
      }

      // 2. REST Fallback Mode
      try {
        const apiKey = this.getApiKey();
        const url = `${this.getRestBaseUrl()}/${collectionName}${apiKey ? `?key=${apiKey}` : ''}`;
        const res = await fetch(url);
        if (!res.ok) {
          const errBody = await res.text();
          throw new Error(`REST fetch failed HTTP ${res.status}: ${errBody}`);
        }
        const data = await res.json();
        const documents = data.documents || [];
        return documents.map(FirestoreParser.decodeDocument);
      } catch (restErr) {
        console.error(`[AppFirebase] REST collection fetch failed for '${collectionName}':`, restErr);
        throw restErr;
      }
    },

    // --------------------------------------------------
    // CRUD: READ SINGLE DOCUMENT
    // --------------------------------------------------
    async getDocument(collectionName, docId) {
      if (!docId) throw new Error('Document ID is required.');
      const mode = this.getTransportMode();

      if (mode === 'SDK') {
        try {
          const docRef = firebase.firestore().collection(collectionName).doc(docId);
          const snap = await docRef.get();
          if (!snap.exists) return null;
          return { id: snap.id, ...snap.data() };
        } catch (err) {
          console.warn(`[AppFirebase] SDK getDocument failed for '${docId}'. Falling back to REST:`, err.message);
        }
      }

      try {
        const apiKey = this.getApiKey();
        const url = `${this.getRestBaseUrl()}/${collectionName}/${docId}${apiKey ? `?key=${apiKey}` : ''}`;
        const res = await fetch(url);
        if (res.status === 404) return null;
        if (!res.ok) throw new Error(`REST HTTP ${res.status}`);
        const data = await res.json();
        return FirestoreParser.decodeDocument(data);
      } catch (err) {
        console.error(`[AppFirebase] getDocument error for '${docId}':`, err);
        throw err;
      }
    },

    // --------------------------------------------------
    // CRUD: CREATE DOCUMENT (ADD)
    // --------------------------------------------------
    async addDocument(collectionName, data) {
      const mode = this.getTransportMode();
      const payload = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString()
      };

      if (mode === 'SDK') {
        try {
          const ref = await firebase.firestore().collection(collectionName).add(payload);
          return { id: ref.id, ...payload };
        } catch (err) {
          console.warn(`[AppFirebase] SDK addDocument failed, falling back to REST:`, err.message);
        }
      }

      try {
        const apiKey = this.getApiKey();
        const url = `${this.getRestBaseUrl()}/${collectionName}${apiKey ? `?key=${apiKey}` : ''}`;
        const restBody = FirestoreParser.encodeDocumentFields(payload);

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restBody)
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`REST addDocument HTTP ${res.status}: ${text}`);
        }
        const createdDoc = await res.json();
        return FirestoreParser.decodeDocument(createdDoc);
      } catch (err) {
        console.error(`[AppFirebase] addDocument error in collection '${collectionName}':`, err);
        throw err;
      }
    },

    // --------------------------------------------------
    // CRUD: UPDATE DOCUMENT
    // --------------------------------------------------
    async updateDocument(collectionName, docId, data) {
      if (!docId) throw new Error('Document ID is required to update.');
      const mode = this.getTransportMode();
      const payload = {
        ...data,
        updatedAt: new Date().toISOString()
      };

      if (mode === 'SDK') {
        try {
          await firebase.firestore().collection(collectionName).doc(docId).update(payload);
          return { id: docId, ...payload };
        } catch (err) {
          console.warn(`[AppFirebase] SDK update failed, falling back to REST:`, err.message);
        }
      }

      try {
        const apiKey = this.getApiKey();
        // Construct field masks for PATCH
        const keys = Object.keys(payload).filter(k => k !== 'id' && !k.startsWith('_'));
        const maskParams = keys.map(k => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join('&');
        const queryParams = [maskParams, apiKey ? `key=${apiKey}` : ''].filter(Boolean).join('&');

        const url = `${this.getRestBaseUrl()}/${collectionName}/${docId}?${queryParams}`;
        const restBody = FirestoreParser.encodeDocumentFields(payload);

        const res = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(restBody)
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`REST updateDocument HTTP ${res.status}: ${text}`);
        }
        const updated = await res.json();
        return FirestoreParser.decodeDocument(updated);
      } catch (err) {
        console.error(`[AppFirebase] updateDocument error for '${docId}':`, err);
        throw err;
      }
    },

    // --------------------------------------------------
    // CRUD: DELETE DOCUMENT
    // --------------------------------------------------
    async deleteDocument(collectionName, docId) {
      if (!docId) throw new Error('Document ID is required to delete.');
      const mode = this.getTransportMode();

      if (mode === 'SDK') {
        try {
          await firebase.firestore().collection(collectionName).doc(docId).delete();
          return true;
        } catch (err) {
          console.warn(`[AppFirebase] SDK delete failed, falling back to REST:`, err.message);
        }
      }

      try {
        const apiKey = this.getApiKey();
        const url = `${this.getRestBaseUrl()}/${collectionName}/${docId}${apiKey ? `?key=${apiKey}` : ''}`;
        const res = await fetch(url, { method: 'DELETE' });
        if (!res.ok && res.status !== 404) {
          throw new Error(`REST delete HTTP ${res.status}`);
        }
        return true;
      } catch (err) {
        console.error(`[AppFirebase] deleteDocument error for '${docId}':`, err);
        throw err;
      }
    },

    // --------------------------------------------------
    // AUTHENTICATION METHODS
    // --------------------------------------------------
    async signInWithEmailAndPassword(email, password) {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        const cred = await firebase.auth().signInWithEmailAndPassword(email, password);
        this._cachedUser = cred.user;
        return cred.user;
      }
      // REST Auth Fallback
      const apiKey = this.getApiKey();
      const endpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, returnSecureToken: true })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }
      const user = {
        uid: data.localId,
        email: data.email,
        idToken: data.idToken,
        refreshToken: data.refreshToken
      };
      this._cachedUser = user;
      localStorage.setItem('sr_auth_user', JSON.stringify(user));
      this._notifyAuthListeners(user);
      return user;
    },

    async signOut() {
      if (typeof firebase !== 'undefined' && firebase.auth) {
        await firebase.auth().signOut();
      }
      this._cachedUser = null;
      localStorage.removeItem('sr_auth_user');
      this._notifyAuthListeners(null);
    },

    getCurrentUser() {
      if (typeof firebase !== 'undefined' && firebase.auth && firebase.auth().currentUser) {
        return firebase.auth().currentUser;
      }
      if (this._cachedUser) return this._cachedUser;
      try {
        const saved = localStorage.getItem('sr_auth_user');
        if (saved) {
          this._cachedUser = JSON.parse(saved);
          return this._cachedUser;
        }
      } catch (e) {}
      return null;
    },

    onAuthStateChanged(callback) {
      if (typeof callback !== 'function') return () => {};
      this._authListeners.push(callback);

      if (typeof firebase !== 'undefined' && firebase.auth) {
        return firebase.auth().onAuthStateChanged((user) => {
          this._cachedUser = user;
          callback(user);
        });
      } else {
        // Trigger with current cached state immediately
        const u = this.getCurrentUser();
        callback(u);
        return () => {
          this._authListeners = this._authListeners.filter(cb => cb !== callback);
        };
      }
    },

    _notifyAuthListeners(user) {
      this._authListeners.forEach(cb => {
        try { cb(user); } catch (e) { console.error(e); }
      });
    }
  };

  // Expose globally
  window.AppFirebase = AppFirebase;
  window.DualTransportDB = AppFirebase;
  window.FirestoreParser = FirestoreParser;

  console.log(`🚀 Social Readers Dual-Transport Engine Ready [Transport: ${AppFirebase.getTransportMode()}]`);
})();
