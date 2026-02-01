/**
 * Dashboard Page
 * Main dashboard with stats, chart, and quick actions
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Calendar,
  Clock,
  HardDrive,
  Upload,
  ArrowRight,
  Play,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/StatCard';
import { GradientButton } from '../components/Button';
import { Skeleton } from '../components/LoadingSpinner';
import { formatDate, getStatusColor } from '../utils/format';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentVideos, setRecentVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/stats');
      setStats(response.data.stats);
      setChartData(response.data.chartData);
      setRecentVideos(response.data.recentVideos);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip for chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-200 border border-dark-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 text-xs">{formatDate(label, 'MMM d')}</p>
          <p className="text-white font-medium">
            {payload[0].value} video{payload[0].value !== 1 ? 's' : ''}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, <span className="text-gradient">Kevin</span>
          </h1>
          <p className="text-gray-400">
            Here's what's happening with your video automation today.
          </p>
        </div>

        <GradientButton
          onClick={() => navigate('/upload')}
          icon={Upload}
        >
          Upload New Video
        </GradientButton>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} variant="card" />
          ))
        ) : (
          <>
            <StatCard
              title="Total Videos"
              value={stats?.totalVideos || 0}
              icon={Video}
              color="primary"
              index={0}
            />
            <StatCard
              title="Videos This Month"
              value={stats?.videosThisMonth || 0}
              icon={Calendar}
              color="gold"
              index={1}
            />
            <StatCard
              title="Time Saved"
              value={`${stats?.processingTimeSavedHours || 0}h`}
              icon={Clock}
              color="green"
              index={2}
            />
            <StatCard
              title="Storage Used"
              value={`${stats?.storageUsedGB || 0} GB`}
              icon={HardDrive}
              color="primary"
              index={3}
            />
          </>
        )}
      </div>

      {/* Chart and Recent videos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-dark-200 rounded-2xl border border-dark-50 p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-4">
            Videos Processed (Last 30 Days)
          </h2>

          {loading ? (
            <div className="h-64">
              <Skeleton variant="card" className="h-full" />
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
                  <XAxis
                    dataKey="date"
                    stroke="#6B7280"
                    fontSize={12}
                    tickFormatter={(value) => formatDate(value, 'MMM d')}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    stroke="#6B7280"
                    fontSize={12}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#colorCount)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>

        {/* Recent videos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-200 rounded-2xl border border-dark-50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Recent Videos</h2>
            <button
              onClick={() => navigate('/history')}
              className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1"
            >
              View all
              <ArrowRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          ) : recentVideos.length === 0 ? (
            <div className="text-center py-8">
              <Video size={48} className="mx-auto text-gray-600 mb-3" />
              <p className="text-gray-400 text-sm">No videos yet</p>
              <button
                onClick={() => navigate('/upload')}
                className="text-primary-400 text-sm mt-2 hover:text-primary-300"
              >
                Upload your first video
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentVideos.map((video) => (
                <div
                  key={video.id}
                  className="flex items-center gap-3 p-3 bg-dark-100 rounded-xl hover:bg-dark-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/processing/${video.id}`)}
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-9 bg-dark-300 rounded-lg overflow-hidden flex-shrink-0">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Play size={14} className="text-gray-600" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{video.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(video.created_at, 'MMM d, h:mm a')}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(video.status)}`}>
                    {video.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <button
          onClick={() => navigate('/upload')}
          className="flex items-center gap-4 p-6 bg-dark-200 rounded-2xl border border-dark-50 hover:border-primary-500/50 transition-all group"
        >
          <div className="p-3 rounded-xl bg-primary-500/20 text-primary-400 group-hover:bg-primary-500/30 transition-colors">
            <Upload size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">Upload Video</h3>
            <p className="text-sm text-gray-400">Start processing</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/history')}
          className="flex items-center gap-4 p-6 bg-dark-200 rounded-2xl border border-dark-50 hover:border-primary-500/50 transition-all group"
        >
          <div className="p-3 rounded-xl bg-gold-500/20 text-gold-400 group-hover:bg-gold-500/30 transition-colors">
            <Clock size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">View History</h3>
            <p className="text-sm text-gray-400">All processed videos</p>
          </div>
        </button>

        <button
          onClick={() => navigate('/youtube')}
          className="flex items-center gap-4 p-6 bg-dark-200 rounded-2xl border border-dark-50 hover:border-primary-500/50 transition-all group"
        >
          <div className="p-3 rounded-xl bg-red-500/20 text-red-400 group-hover:bg-red-500/30 transition-colors">
            <Video size={24} />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-white">YouTube Studio</h3>
            <p className="text-sm text-gray-400">Manage uploads</p>
          </div>
        </button>
      </motion.div>
    </div>
  );
}

export default Dashboard;
