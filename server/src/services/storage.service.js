const { supabaseAdmin } = require('../config/supabase');
const logger = require('../utils/logger');
const path = require('path');

/**
 * Upload file to Supabase Storage
 */
const uploadFile = async (file, bucket, folder = '') => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const filename = `${folder ? folder + '/' : ''}${basename}-${timestamp}${ext}`;

    // Upload to Supabase
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from(bucket)
      .getPublicUrl(filename);

    return {
      path: data.path,
      url: publicUrl,
      filename: file.originalname,
      type: file.mimetype,
      size: file.size
    };

  } catch (error) {
    logger.error(`Storage upload error (${bucket}):`, error);
    throw error;
  }
};

/**
 * Delete file from Supabase Storage
 */
const deleteFile = async (bucket, filePath) => {
  try {
    const { error } = await supabaseAdmin
      .storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      throw error;
    }
    
    return true;
  } catch (error) {
    logger.error(`Storage delete error (${bucket}):`, error);
    throw error;
  }
};

/**
 * Get file URL (signed URL for private buckets)
 */
const getFileUrl = async (bucket, filePath, expiresIn = 3600) => {
  try {
    const { data, error } = await supabaseAdmin
      .storage
      .from(bucket)
      .createSignedUrl(filePath, expiresIn);

    if (error) {
      throw error;
    }

    return data.signedUrl;
  } catch (error) {
    logger.error(`Storage get URL error (${bucket}):`, error);
    throw error;
  }
};

module.exports = {
  uploadFile,
  deleteFile,
  getFileUrl
};
