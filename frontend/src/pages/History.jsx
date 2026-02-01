/**
 * History Page
 * Video processing history with filters and pagination
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Download,
  Trash2,
  ExternalLink,
  Eye,
  Play,
  ChevronLeft,
  ChevronRight,
  Video,
  Upload,
  Calendar,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import Button from '../components/Button';
import { Skeleton } from '../components/LoadingSpinner';
import { ConfirmModal } from '../components/Modal';
import {
  formatDate,
  formatDuration,
  formatFileSize,
  getStatusColor,
  truncateText,
} from '../utils/format';

// Debounce hook
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

function History() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // Delete modal
  const [deleteVideo, setDeleteVideo] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 300);
  const navigate = useNavigate();

  // Fetch videos
  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/videos', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          status: status !== 'all' ? status : undefined,
          search: debouncedSearch || undefined,
          sortBy,
          sortOrder,
        },
      });

      setVideos(response.data.videos);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to fetch videos:', error);
      toast.error('Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, status, debouncedSearch, sortBy, sortOrder]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Handle delete
  const handleDelete = async () => {
    if (!deleteVideo) return;

    setDeleting(true);
    try {
      await api.delete(`/videos/${deleteVideo.id}`);
      toast.success('Video deleted');
      fetchVideos();
    } catch (error) {
      toast.error('Failed to delete video');
    } finally {
      setDeleting(false);
      setDeleteVideo(null);
    }
  };

  // Handle export CSV
  const handleExportCSV = async () => {
    try {
      const response = await api.get('/stats/export', {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `karma-ops-history-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success('History exported');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  // Toggle sort
  const toggleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
    setPagination((p) => ({ ...p, page: 1 }));
  };

  return (
    <div>
      <ConfirmModal
        isOpen={!!deleteVideo}
        onClose={() => setDeleteVideo(null)}
        onConfirm={handleDelete}
        title="Delete Video?"
        message={`Are you sure you want to delete "${deleteVideo?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">History</h1>
          <p className="text-gray-400">
            View and manage all your processed videos.
          </p>
        </div>

        <Button
          onClick={handleExportCSV}
          variant="secondary"
          icon={Download}
        >
          Export CSV
        </Button>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-200 rounded-2xl border border-dark-50 p-4 mb-6"
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPagination((p) => ({ ...p, page: 1 }));
              }}
              placeholder="Search by title..."
              className="w-full bg-dark-100 border border-dark-50 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            />
          </div>

          {/* Status filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="bg-dark-100 border border-dark-50 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [newSortBy, newSortOrder] = e.target.value.split('-');
              setSortBy(newSortBy);
              setSortOrder(newSortOrder);
              setPagination((p) => ({ ...p, page: 1 }));
            }}
            className="bg-dark-100 border border-dark-50 rounded-xl px-4 py-2.5 text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          >
            <option value="created_at-desc">Newest First</option>
            <option value="created_at-asc">Oldest First</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="title-desc">Title (Z-A)</option>
            <option value="duration-desc">Longest First</option>
            <option value="duration-asc">Shortest First</option>
          </select>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-200 rounded-2xl border border-dark-50 overflow-hidden"
      >
        {loading ? (
          <div className="p-6 space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-16">
            <Video size={48} className="mx-auto text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No videos yet</h3>
            <p className="text-gray-400 mb-6">
              Upload your first video to get started!
            </p>
            <Button
              onClick={() => navigate('/upload')}
              variant="primary"
              icon={Upload}
            >
              Upload Video
            </Button>
          </div>
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-dark-300 border-b border-dark-50">
              <div className="col-span-5 text-sm font-medium text-gray-400">
                Video
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-400">
                Status
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-400">
                Date
              </div>
              <div className="col-span-1 text-sm font-medium text-gray-400">
                Duration
              </div>
              <div className="col-span-2 text-sm font-medium text-gray-400 text-right">
                Actions
              </div>
            </div>

            {/* Table body */}
            <div className="divide-y divide-dark-50">
              {videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 hover:bg-dark-100/50 transition-colors"
                >
                  {/* Video info */}
                  <div className="md:col-span-5 flex items-center gap-4">
                    {/* Thumbnail */}
                    <div
                      className="w-20 h-[45px] bg-dark-300 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
                      onClick={() => navigate(`/processing/${video.id}`)}
                    >
                      {video.thumbnail_url ? (
                        <img
                          src={video.thumbnail_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play size={16} className="text-gray-600" />
                        </div>
                      )}
                    </div>

                    {/* Title */}
                    <div
                      className="min-w-0 cursor-pointer"
                      onClick={() => navigate(`/processing/${video.id}`)}
                    >
                      <p
                        className="font-medium text-white truncate hover:text-primary-400 transition-colors"
                        title={video.title || video.original_filename}
                      >
                        {truncateText(video.title || video.original_filename, 40)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(video.file_size)}
                      </p>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 flex items-center">
                    <span
                      className={`text-xs px-3 py-1 rounded-full border ${getStatusColor(
                        video.status
                      )}`}
                    >
                      {video.status}
                    </span>
                  </div>

                  {/* Date */}
                  <div className="md:col-span-2 flex items-center">
                    <div className="text-sm text-gray-400">
                      <p>{formatDate(video.created_at, 'MMM d, yyyy')}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(video.created_at, 'h:mm a')}
                      </p>
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="md:col-span-1 flex items-center">
                    <span className="text-sm text-gray-400">
                      {video.duration ? formatDuration(video.duration) : '-'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-2 flex items-center justify-end gap-2">
                    <button
                      onClick={() => navigate(`/processing/${video.id}`)}
                      className="p-2 hover:bg-dark-50 rounded-lg transition-colors text-gray-400 hover:text-white"
                      title="View"
                    >
                      <Eye size={18} />
                    </button>
                    {video.youtube_url && (
                      <a
                        href={video.youtube_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-dark-50 rounded-lg transition-colors text-gray-400 hover:text-primary-400"
                        title="Open on YouTube"
                      >
                        <ExternalLink size={18} />
                      </a>
                    )}
                    <button
                      onClick={() => setDeleteVideo(video)}
                      className="p-2 hover:bg-dark-50 rounded-lg transition-colors text-gray-400 hover:text-red-400"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-dark-300 border-t border-dark-50">
                <p className="text-sm text-gray-400">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} videos
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page - 1 }))
                    }
                    disabled={pagination.page === 1}
                    className="p-2 hover:bg-dark-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === pagination.totalPages ||
                        Math.abs(page - pagination.page) <= 1
                    )
                    .map((page, index, arr) => (
                      <span key={page}>
                        {index > 0 && arr[index - 1] !== page - 1 && (
                          <span className="text-gray-600 px-1">...</span>
                        )}
                        <button
                          onClick={() =>
                            setPagination((p) => ({ ...p, page }))
                          }
                          className={`w-8 h-8 rounded-lg transition-colors ${
                            page === pagination.page
                              ? 'bg-primary-500 text-white'
                              : 'hover:bg-dark-50 text-gray-400'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}

                  <button
                    onClick={() =>
                      setPagination((p) => ({ ...p, page: p.page + 1 }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="p-2 hover:bg-dark-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-400"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}

export default History;
