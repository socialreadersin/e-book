/**
 * Social Readers - Cloudinary Upload & Delivery Integration
 * Handles Cover Images (Standard Image Endpoint) and E-Book PDFs/Audiobooks (resource_type: raw)
 */

window.SocialReadersCloudinary = {
  getCloudName() {
    return localStorage.getItem('sr_cloudinary_cloud_name') || "social-readers-demo";
  },

  getUploadPreset() {
    return localStorage.getItem('sr_cloudinary_upload_preset') || "sr_unsigned_preset";
  },

  /**
   * Upload Cover Image to Cloudinary
   * @param {File} file 
   * @param {Function} onProgress 
   * @returns {Promise<string>} Secure URL
   */
  async uploadImage(file, onProgress) {
    const cloudName = this.getCloudName();
    const uploadPreset = this.getUploadPreset();
    
    // If running in local demo without live Cloudinary credentials, simulate instant upload
    if (cloudName === 'social-readers-demo') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 800);
      });
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Cloudinary Image Upload Failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  },

  /**
   * Upload PDF or Audio file as Raw Resource
   * CRITICAL SPEC RULE: Must use resource_type: raw for PDFs and audio
   * @param {File} file 
   * @param {Function} onProgress 
   * @returns {Promise<string>} Secure URL
   */
  async uploadRawResource(file, onProgress) {
    const cloudName = this.getCloudName();
    const uploadPreset = this.getUploadPreset();

    if (cloudName === 'social-readers-demo') {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(URL.createObjectURL(file));
        }, 1000);
      });
    }

    const url = `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Cloudinary Raw Resource Upload Failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.secure_url;
  }
};
