/**
 * Generated Cloudinary Upload Service
 */
const CLOUDINARY_CONFIG = {
  "cloudName": "socialreaders",
  "uploadPreset": "tfy3lcci",
  "folder": "ebooks"
};

window.CloudinaryService = {
  async uploadImage(file) {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPreset);
    formData.append("folder", CLOUDINARY_CONFIG.folder);
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`, {
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
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

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
          let errorMsg = `Cloudinary upload failed (HTTP ${xhr.status})`;
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
