/**
 * Video Card Component
 * Display video thumbnail with info
 */

import { motion } from 'framer-motion';
import {
  Play,
  ExternalLink,
  Clock,
  Eye,
  Calendar,
  Tag,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { formatDuration, formatRelativeTime, formatNumber, truncateText } from '../utils/format';

function VideoCard({ video, index = 0, showDetails = true }) {
  const [expanded, setExpanded] = useState(false);

  const privacyBadge = {
    public: 'bg-green-500/20 text-green-400 border-green-500/30',
    unlisted: 'bg-primary-500/20 text-primary-400 border-primary-500/30',
    private: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-dark-200 rounded-2xl border border-dark-50 overflow-hidden card-hover"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video bg-dark-300 group">
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Play size={48} className="text-gray-600" />
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
            href={video.youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-primary-500 rounded-full hover:bg-primary-600 transition-colors"
          >
            <Play size={24} className="text-white" fill="white" />
          </a>
        </div>

        {/* Duration badge */}
        {video.duration > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        )}

        {/* Privacy badge */}
        {video.privacyStatus && (
          <div className={`absolute top-2 left-2 text-xs px-2 py-1 rounded border ${privacyBadge[video.privacyStatus] || privacyBadge.public}`}>
            {video.privacyStatus.toUpperCase()}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-white mb-2 line-clamp-2" title={video.title}>
          {video.title || 'Untitled Video'}
        </h3>

        {showDetails && (
          <>
            {/* Stats row */}
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              {video.viewCount !== undefined && (
                <div className="flex items-center gap-1">
                  <Eye size={14} />
                  <span>{formatNumber(video.viewCount)}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{formatRelativeTime(video.publishedAt)}</span>
              </div>
            </div>

            {/* Tags */}
            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {video.tags.slice(0, 3).map((tag, i) => (
                  <span
                    key={i}
                    className="text-xs bg-dark-100 text-gray-400 px-2 py-0.5 rounded"
                  >
                    {tag}
                  </span>
                ))}
                {video.tags.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{video.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {video.description && (
              <div className="mb-3">
                <p className={`text-sm text-gray-400 ${expanded ? '' : 'line-clamp-2'}`}>
                  {video.description}
                </p>
                {video.description.length > 100 && (
                  <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary-400 text-sm flex items-center gap-1 mt-1 hover:text-primary-300"
                  >
                    {expanded ? 'Show less' : 'Read more'}
                    <ChevronDown
                      size={14}
                      className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                  </button>
                )}
              </div>
            )}

            {/* Action button */}
            <a
              href={video.studioUrl || `https://studio.youtube.com/video/${video.id}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-primary-400 hover:text-primary-300 transition-colors"
            >
              <ExternalLink size={14} />
              Edit on YouTube
            </a>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default VideoCard;
