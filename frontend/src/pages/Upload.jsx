/**
 * Upload Page
 * Video upload with drag & drop
 */

import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload as UploadIcon,
  File,
  X,
  AlertTriangle,
  CheckCircle,
  Play,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Button, { GradientButton } from '../components/Button';
import { LoadingOverlay } from '../components/LoadingSpinner';
import { formatFileSize } from '../utils/format';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ACCEPTED_TYPES = {
  'video/mp4': ['.mp4'],
  'video/quicktime': ['.mov'],
  'video/x-msvideo': ['.avi'],
};

function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [confirmed, setConfirmed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  // Dropzone configuration
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');

    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.file.size > MAX_FILE_SIZE) {
        setError('File too large. Maximum size is 500MB.');
      } else {
        setError('Invalid file type. Only MP4, MOV, and AVI files are allowed.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      setFile(selectedFile);

      // Create video preview
      const url = URL.createObjectURL(selectedFile);
      setPreview(url);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  // Remove file
  const removeFile = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setConfirmed(false);
    setError('');
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file || !confirmed) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      const response = await api.post('/videos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 300000, // 5 minutes timeout for upload
      });

      if (response.data.success) {
        toast.success('Video uploaded successfully!');
        navigate(`/processing/${response.data.videoId}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(message);
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <AnimatePresence>
        {uploading && <LoadingOverlay text="Uploading your video..." />}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Upload Video</h1>
        <p className="text-gray-400">
          Upload your video for automatic editing and YouTube publishing.
        </p>
      </motion.div>

      {/* Dropzone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {!file ? (
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-2xl p-12
              transition-all duration-300 cursor-pointer
              ${isDragActive
                ? 'border-gold-500 bg-gold-500/5'
                : 'border-primary-500/50 hover:border-primary-400 hover:bg-primary-500/5'
              }
            `}
          >
            <input {...getInputProps()} />

            <div className="text-center">
              <motion.div
                animate={{ y: isDragActive ? -10 : 0 }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500/20 to-gold-500/20 flex items-center justify-center"
              >
                <UploadIcon
                  size={32}
                  className={isDragActive ? 'text-gold-400' : 'text-primary-400'}
                />
              </motion.div>

              <h3 className="text-lg font-medium text-white mb-2">
                {isDragActive ? 'Drop your video here' : 'Drag & drop your video'}
              </h3>
              <p className="text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-sm text-gray-500">
                Accepted: MP4, MOV, AVI • Max size: 500MB
              </p>
            </div>
          </div>
        ) : (
          /* File preview */
          <div className="bg-dark-200 rounded-2xl border border-dark-50 overflow-hidden">
            {/* Video preview */}
            <div className="relative aspect-video bg-black">
              {preview && (
                <video
                  src={preview}
                  className="w-full h-full object-contain"
                  controls={false}
                  muted
                />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="p-4 rounded-full bg-primary-500/20">
                  <Play size={32} className="text-primary-400" />
                </div>
              </div>
            </div>

            {/* File info */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-500/20">
                    <File size={24} className="text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{file.name}</p>
                    <p className="text-sm text-gray-400">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                <button
                  onClick={removeFile}
                  className="p-2 hover:bg-dark-100 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Warning badge */}
              <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-4">
                <AlertTriangle size={18} className="text-yellow-400 flex-shrink-0" />
                <p className="text-sm text-yellow-300">
                  Video will be published as <strong>UNLISTED</strong> on YouTube
                </p>
              </div>

              {/* Confirmation checkbox */}
              <label className="flex items-start gap-3 p-4 bg-dark-100 rounded-xl cursor-pointer hover:bg-dark-50 transition-colors">
                <input
                  type="checkbox"
                  checked={confirmed}
                  onChange={(e) => setConfirmed(e.target.checked)}
                  className="mt-0.5"
                />
                <span className="text-sm text-gray-300">
                  I confirm this video is ready for automatic editing and YouTube upload.
                  I understand the process cannot be undone.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3"
          >
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </motion.div>
        )}

        {/* Upload button */}
        {file && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6"
          >
            <GradientButton
              onClick={handleUpload}
              disabled={!confirmed}
              loading={uploading}
              fullWidth
              icon={UploadIcon}
            >
              Start Processing
            </GradientButton>

            {!confirmed && (
              <p className="text-center text-sm text-gray-500 mt-3">
                Please confirm above to enable upload
              </p>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Info section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 p-6 bg-dark-200 rounded-2xl border border-dark-50"
      >
        <h3 className="font-medium text-white mb-4">What happens next?</h3>
        <ol className="space-y-3 text-sm text-gray-400">
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs">1</span>
            Video is uploaded to our processing server
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs">2</span>
            AI extracts and transcribes audio
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs">3</span>
            Video is automatically edited and optimized
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs">4</span>
            AI generates thumbnail and metadata
          </li>
          <li className="flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-gold-500/20 text-gold-400 flex items-center justify-center text-xs">5</span>
            Published to YouTube as UNLISTED
          </li>
        </ol>
      </motion.div>
    </div>
  );
}

export default Upload;
