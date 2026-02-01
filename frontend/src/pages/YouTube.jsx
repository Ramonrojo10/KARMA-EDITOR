/**
 * YouTube Studio Page
 * Display videos from YouTube channel
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  ExternalLink,
  Play,
  Eye,
  Calendar,
  Tag,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import VideoCard from '../components/VideoCard';
import { Skeleton } from '../components/LoadingSpinner';
import Button from '../components/Button';

function YouTube() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [source, setSource] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get('/youtube/videos');
      setVideos(response.data.videos);
      setSource(response.data.source);

      if (response.data.source === 'mock') {
        setError(response.data.message || 'Using demo data');
      }
    } catch (err) {
      console.error('Failed to fetch YouTube videos:', err);
      setError('Failed to load videos from YouTube');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVideos();
    setRefreshing(false);
    toast.success('Videos refreshed');
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">YouTube Studio</h1>
          <p className="text-gray-400">
            View and manage your YouTube uploads.
          </p>
        </div>

        <Button
          onClick={handleRefresh}
          variant="secondary"
          icon={RefreshCw}
          loading={refreshing}
          className={refreshing ? 'animate-spin-slow' : ''}
        >
          Refresh
        </Button>
      </motion.div>

      {/* Info banner */}
      {source === 'mock' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 mb-6 flex items-start gap-3"
        >
          <AlertCircle size={20} className="text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-300 font-medium">Demo Mode</p>
            <p className="text-yellow-300/70 text-sm">
              {error || 'Configure your YouTube API key in settings to see real videos.'}
            </p>
          </div>
        </motion.div>
      )}

      {/* Video grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton variant="thumbnail" />
                  <Skeleton variant="title" className="w-3/4" />
                  <Skeleton variant="text" className="w-1/2" />
                </div>
              ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16 bg-dark-200 rounded-2xl border border-dark-50">
            <Play size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No videos found</h3>
            <p className="text-gray-400">
              Your uploaded videos will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video, index) => (
              <VideoCard key={video.id} video={video} index={index} />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default YouTube;
