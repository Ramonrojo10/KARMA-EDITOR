/**
 * File Upload Middleware
 * Handles multipart/form-data uploads using Multer
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const UPLOAD_DIR = process.env.UPLOAD_DIR || '/tmp/uploads';
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and UUID
    const timestamp = Date.now();
    const uniqueId = uuidv4().split('-')[0];
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(ext, '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .substring(0, 50);

    cb(null, `${timestamp}_${uniqueId}_${safeName}${ext}`);
  },
});

// File filter - only allow video files
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/x-msvideo', // .avi
    'video/x-ms-wmv',
    'video/webm',
    'video/mpeg',
  ];

  const allowedExts = ['.mp4', '.mov', '.avi', '.wmv', '.webm', '.mpeg', '.mpg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimes.includes(file.mimetype) || allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed: ${allowedExts.join(', ')}`), false);
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max
    files: 1, // Only one file at a time
  },
});

/**
 * Single video upload middleware
 */
export const uploadVideo = upload.single('video');

/**
 * Error handler for upload errors
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Maximum file size is 500MB',
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Only one file can be uploaded at a time',
      });
    }
    return res.status(400).json({
      error: 'Upload error',
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      error: 'Upload failed',
      message: err.message,
    });
  }

  next();
};

export default { uploadVideo, handleUploadError, UPLOAD_DIR };
