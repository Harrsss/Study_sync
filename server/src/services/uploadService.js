const cloudinary = require('cloudinary').v2;
const fs = require('fs');

// Configure Cloudinary if credentials are provided in environment
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
} else if (process.env.CLOUDINARY_URL) {
  cloudinary.config();
}

const isCloudinaryEnabled = () => {
  return Boolean(
    (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) ||
    process.env.CLOUDINARY_URL
  );
};

/**
 * Uploads file to Cloudinary (in production) or uses local disk url
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} File metadata with permanent URL
 */
const processFileUpload = async (file) => {
  if (!file) return null;

  const isImage = file.mimetype.startsWith('image/');
  const resourceType = isImage ? 'image' : 'raw'; // raw for PDFs

  if (isCloudinaryEnabled()) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: 'studysync_uploads',
        resource_type: resourceType,
        use_filename: true,
        unique_filename: true
      });

      // Remove temporary local file after successful cloud upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: result.secure_url,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        storage: 'cloudinary'
      };
    } catch (err) {
      console.error('[Cloudinary Upload Error, falling back to local]', err.message);
    }
  }

  // Local disk fallback
  return {
    url: `/uploads/${file.filename}`,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storage: 'local'
  };
};

module.exports = {
  processFileUpload,
  isCloudinaryEnabled
};
