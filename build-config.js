const fs = require('fs');
const path = require('path');

// Zero-dependency local .env loader
function loadLocalEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        content.split('\n').forEach(line => {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const key = trimmed.substring(0, idx).trim();
            const val = trimmed.substring(idx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) process.env[key] = val;
          }
        });
        console.log(`📄 Loaded local environment variables from ${file}`);
      } catch (err) {
        console.warn(`Could not read ${file}:`, err.message);
      }
    }
  }
}

loadLocalEnv();

const jsDir = path.join(__dirname, 'js');
if (!fs.existsSync(jsDir)) fs.mkdirSync(jsDir, { recursive: true });

// 1. Firebase Config Object
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.FIREBASE_PROJECT_ID || "",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.FIREBASE_APP_ID || "",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || ""
};

const firebaseConfigFileContent = `/**
 * Generated Firebase Configuration for E-Book Project
 */
const baseFirebaseConfig = ${JSON.stringify(firebaseConfig, null, 2)};
const savedLocalApiKey = (typeof localStorage !== 'undefined') ? (localStorage.getItem('ebook_firebase_api_key') || localStorage.getItem('sr_firebase_api_key')) : null;
const firebaseConfig = {
  ...baseFirebaseConfig,
  apiKey: (savedLocalApiKey || baseFirebaseConfig.apiKey || '').trim()
};
window.firebaseConfig = firebaseConfig;

window.FirebaseService = {
  isConfigured() {
    return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10);
  },
  init() {
    if (typeof firebase !== 'undefined') {
      if (this.isConfigured()) {
        try {
          if (!firebase.apps.length) {
            window.firebaseApp = firebase.initializeApp(firebaseConfig);
          } else {
            window.firebaseApp = firebase.app();
          }
          window.firebaseAuth = firebase.auth();
          window.firebaseDb = firebase.firestore();
          console.log("🔥 Live Firebase initialized for E-Book:", firebaseConfig.projectId);
        } catch (err) {
          console.error("Firebase Init Error:", err);
        }
      } else {
        console.log("⚡ Operating in direct REST fallback mode.");
      }
    }
  }
};

// Immediate synchronous initialization so subsequent scripts have active Firebase app
window.FirebaseService.init();

document.addEventListener('DOMContentLoaded', () => {
  if (!window.firebaseApp && typeof firebase !== 'undefined' && window.FirebaseService.isConfigured()) {
    window.FirebaseService.init();
  }
});
`;

fs.writeFileSync(path.join(jsDir, 'firebase-config.js'), firebaseConfigFileContent, 'utf8');

// 2. Cloudinary Config Object
const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || "",
  folder: process.env.CLOUDINARY_FOLDER || "ebooks"
};

const cloudinaryConfigFileContent = `/**
 * Generated Cloudinary Upload Service
 */
const CLOUDINARY_CONFIG = ${JSON.stringify(cloudinaryConfig, null, 2)};

window.CloudinaryService = {
  async uploadImage(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", CLOUDINARY_CONFIG.folder);
    try {
      const res = await fetch(\`https://api.cloudinary.com/v1_1/\${CLOUDINARY_CONFIG.cloudName}/image/upload\`, {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (data.secure_url) {
        console.log("☁️ Image uploaded to Cloudinary:", data.secure_url);
        return data.secure_url;
      }
      console.warn("Cloudinary Response:", data);
      return null;
    } catch (err) {
      console.error("Cloudinary Upload Error:", err);
      return null;
    }
  }
};

// Backward-compatible bridge to existing SocialReadersCloudinary API
window.SocialReadersCloudinary = {
  async uploadToCloudinary(file, resourceType = 'image', onProgress = null) {
    const cloudName = CLOUDINARY_CONFIG.cloudName || localStorage.getItem('sr_cloudinary_cloud_name') || 'socialreaders';
    const uploadPreset = CLOUDINARY_CONFIG.uploadPreset || localStorage.getItem('sr_cloudinary_preset') || 'tfy3lcci';
    const folder = CLOUDINARY_CONFIG.folder || 'book/images';
    const url = \`https://api.cloudinary.com/v1_1/\${cloudName}/\${resourceType}/upload\`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', folder);

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);
      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
        });
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            resolve(JSON.parse(xhr.responseText));
          } catch (e) {
            reject(new Error("Invalid JSON response from Cloudinary"));
          }
        } else {
          let errorMsg = \`Cloudinary upload failed (HTTP \${xhr.status})\`;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData && errData.error && errData.error.message) errorMsg = errData.error.message;
          } catch (e) {}
          reject(new Error(errorMsg));
        }
      };
      xhr.onerror = () => reject(new Error("Network error during Cloudinary file upload"));
      xhr.send(formData);
    });
  }
};
`;

fs.writeFileSync(path.join(jsDir, 'cloudinary.config.js'), cloudinaryConfigFileContent, 'utf8');

console.log('✅ Configuration files generated in js/');
