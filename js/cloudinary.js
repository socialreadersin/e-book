/**
 * Social Readers - Cloudinary Unsigned Media Upload Utility
 * Handles Cover Images (image), E-Book PDFs (raw), and Audio MP3s (video)
 * Pulls cloud name & upload preset dynamically from Firestore settings / localStorage
 */

window.SocialReadersCloudinary = {
  // Get active Cloudinary configuration
  async getConfig() {
    let cloudName = localStorage.getItem('sr_cloudinary_cloud_name') || 'socialreaders';
    let uploadPreset = localStorage.getItem('sr_cloudinary_preset') || 'tfy3lcci';

    if (window.SocialReadersDB && window.SocialReadersDB.getSettings) {
      try {
        const settings = await window.SocialReadersDB.getSettings();
        if (settings.cloudinaryCloudName) cloudName = settings.cloudinaryCloudName;
        if (settings.cloudinaryUploadPreset) uploadPreset = settings.cloudinaryUploadPreset;
      } catch (err) {
        console.warn("Could not load Cloudinary settings from Firestore:", err);
      }
    }

    return { cloudName, uploadPreset };
  },

  /**
   * Upload file to Cloudinary with progress callback
   * @param {File} file - File from <input type="file">
   * @param {'image' | 'raw' | 'video'} resourceType - 'image' for covers, 'raw' for PDFs, 'video' for audio MP3s
   * @param {Function} onProgress - Callback function(percentComplete)
   * @returns {Promise<{ secure_url: string, public_id: string, format: string }>}
   */
  async uploadToCloudinary(file, resourceType = 'image', onProgress = null) {
    if (!file) throw new Error("No file provided for upload");

    const config = await this.getConfig();
    const url = `https://api.cloudinary.com/v1_1/${config.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    formData.append('folder', 'book/images');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', url, true);

      if (onProgress && xhr.upload) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const percent = Math.round((e.loaded / e.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({
              secure_url: data.secure_url,
              public_id: data.public_id,
              format: data.format,
              bytes: data.bytes
            });
          } catch (e) {
            reject(new Error("Invalid JSON response from Cloudinary"));
          }
        } else {
          let errorMsg = `Cloudinary upload failed (HTTP ${xhr.status})`;
          try {
            const errData = JSON.parse(xhr.responseText);
            if (errData && errData.error && errData.error.message) {
              errorMsg = errData.error.message;
            }
          } catch (e) {}
          console.error("Cloudinary upload error:", errorMsg, xhr.responseText);
          reject(new Error(errorMsg));
        }
      };

      xhr.onerror = () => {
        const errorMsg = "Network error during Cloudinary file upload. Please check your internet connection.";
        console.error(errorMsg);
        reject(new Error(errorMsg));
      };

      xhr.send(formData);
    });
  }
};
