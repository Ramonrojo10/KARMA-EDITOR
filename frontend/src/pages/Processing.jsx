/**
 * Processing Status Page
 * Real-time video processing progress
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  Upload,
  Mic,
  FileText,
  Scissors,
  Film,
  Volume2,
  Image,
  Youtube,
  PartyPopper,
  ExternalLink,
  ArrowLeft,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import { ConfirmModal } from '../components/Modal';
import { formatDuration } from '../utils/format';

// Processing steps configuration
const PROCESSING_STEPS = [
  { key: 'uploading', label: 'Uploading', icon: Upload },
  { key: 'extracting_audio', label: 'Extracting audio', icon: Mic },
  { key: 'transcribing', label: 'Transcribing with AI', icon: FileText },
  { key: 'cutting_segments', label: 'Cutting segments', icon: Scissors },
  { key: 'stitching', label: 'Stitching video', icon: Film },
  { key: 'normalizing_audio', label: 'Normalizing audio', icon: Volume2 },
  { key: 'generating_thumbnail', label: 'Generating AI thumbnail', icon: Image },
  { key: 'uploading_youtube', label: 'Uploading to YouTube', icon: Youtube },
  { key: 'complete', label: 'Complete!', icon: PartyPopper },
];

function Processing() {
  const { videoId } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Fetch status on mount and poll
  useEffect(() => {
    fetchStatus();

    // Poll every 5 seconds while processing
    const interval = setInterval(() => {
      if (status?.status === 'processing') {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [videoId, status?.status]);

  const fetchStatus = async () => {
    try {
      const response = await api.get(`/videos/${videoId}/status`);
      setStatus(response.data.status);

      // Show notification on completion
      if (response.data.status.status === 'completed') {
        toast.success('Video processing complete!');

        // Request browser notification permission
        if (Notification.permission === 'granted') {
          new Notification('KARMA OPS EDITOR', {
            body: 'Your video has been processed and uploaded to YouTube!',
            icon: '/favicon.svg',
          });
        }
      }
    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError('Failed to load video status');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await api.post(`/videos/${videoId}/cancel`);
      toast.success('Processing cancelled');
      navigate('/history');
    } catch (err) {
      toast.error('Failed to cancel processing');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  // Get current step index
  const getCurrentStepIndex = () => {
    if (!status) return 0;
    const index = PROCESSING_STEPS.findIndex(s => s.key === status.current_step);
    return index >= 0 ? index : 0;
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCompleted = status?.status === 'completed';
  const isFailed = status?.status === 'failed';
  const isProcessing = status?.status === 'processing';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" text="Loading status..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <Button onClick={() => navigate('/history')} variant="secondary">
          Back to History
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancel}
        title="Cancel Processing?"
        message="Are you sure you want to cancel? This will stop the current processing and cannot be undone."
        confirmText="Yes, Cancel"
        variant="danger"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={18} />
          Back to History
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">
          {isCompleted ? 'Processing Complete!' : isFailed ? 'Processing Failed' : 'Processing Video'}
        </h1>
        <p className="text-gray-400">
          {isCompleted
            ? 'Your video has been uploaded to YouTube.'
            : isFailed
            ? 'There was an error processing your video.'
            : 'Please wait while we process your video.'}
        </p>
      </motion.div>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Progress</span>
          <span className="text-sm font-medium text-white">{status?.progress || 0}%</span>
        </div>
        <div className="h-3 bg-dark-100 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              isFailed
                ? 'bg-red-500'
                : isCompleted
                ? 'bg-gradient-to-r from-primary-500 to-gold-500'
                : 'bg-primary-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${status?.progress || 0}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {isProcessing && (
          <p className="text-sm text-gray-500 mt-2">
            Estimated time: ~15-20 minutes remaining
          </p>
        )}
      </motion.div>

      {/* Steps timeline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-200 rounded-2xl border border-dark-50 p-6 mb-8"
      >
        <div className="space-y-1">
          {PROCESSING_STEPS.map((step, index) => {
            const isActive = index === currentStepIndex && isProcessing;
            const isDone = index < currentStepIndex || isCompleted;
            const isError = isFailed && index === currentStepIndex;
            const isPending = index > currentStepIndex;

            const Icon = step.icon;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
                  isActive ? 'bg-primary-500/10' : ''
                }`}
              >
                {/* Status icon */}
                <div className="relative">
                  {isDone && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center"
                    >
                      <CheckCircle size={18} className="text-green-400" />
                    </motion.div>
                  )}
                  {isActive && (
                    <div className="w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <Loader2 size={18} className="text-primary-400 animate-spin" />
                    </div>
                  )}
                  {isError && (
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
                      <XCircle size={18} className="text-red-400" />
                    </div>
                  )}
                  {isPending && !isFailed && (
                    <div className="w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center">
                      <Circle size={18} className="text-gray-600" />
                    </div>
                  )}

                  {/* Connecting line */}
                  {index < PROCESSING_STEPS.length - 1 && (
                    <div
                      className={`absolute left-1/2 top-8 w-0.5 h-8 -translate-x-1/2 ${
                        isDone ? 'bg-green-500/50' : 'bg-dark-100'
                      }`}
                    />
                  )}
                </div>

                {/* Step info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Icon
                      size={16}
                      className={
                        isDone
                          ? 'text-green-400'
                          : isActive
                          ? 'text-primary-400'
                          : isError
                          ? 'text-red-400'
                          : 'text-gray-600'
                      }
                    />
                    <span
                      className={`font-medium ${
                        isDone || isActive
                          ? 'text-white'
                          : isError
                          ? 'text-red-400'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        {isCompleted && status?.youtube_url && (
          <a
            href={status.youtube_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              variant="gradient"
              fullWidth
              icon={ExternalLink}
              iconPosition="right"
            >
              View on YouTube
            </Button>
          </a>
        )}

        {isProcessing && (
          <Button
            variant="danger"
            onClick={() => setShowCancelModal(true)}
            loading={cancelling}
            icon={X}
            fullWidth
          >
            Cancel Processing
          </Button>
        )}

        {(isCompleted || isFailed) && (
          <Button
            variant="secondary"
            onClick={() => navigate('/upload')}
            icon={Upload}
            fullWidth
          >
            Upload Another Video
          </Button>
        )}
      </motion.div>
    </div>
  );
}

export default Processing;
