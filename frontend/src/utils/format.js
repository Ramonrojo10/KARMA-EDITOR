/**
 * Formatting Utilities
 */

import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Format file size in bytes to human readable string
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "234 MB")
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
}

/**
 * Format duration in seconds to HH:MM:SS or MM:SS
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format date to readable string
 * @param {string|Date} date - Date to format
 * @param {string} formatStr - Format string
 * @returns {string} Formatted date
 */
export function formatDate(date, formatStr = 'MMM d, yyyy h:mm a') {
  if (!date) return '';

  const d = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(d)) return '';

  return format(d, formatStr);
}

/**
 * Format date as relative time (e.g., "2 days ago")
 * @param {string|Date} date - Date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
  if (!date) return '';

  const d = typeof date === 'string' ? parseISO(date) : date;

  if (!isValid(d)) return '';

  return formatDistanceToNow(d, { addSuffix: true });
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Format percentage
 * @param {number} value - Value (0-100)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  if (value === null || value === undefined) return '0%';
  return `${Math.round(value)}%`;
}

/**
 * Get status badge color class
 * @param {string} status - Status string
 * @returns {string} Tailwind color classes
 */
export function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'completed':
    case 'complete':
    case 'success':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'processing':
    case 'in_progress':
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'failed':
    case 'error':
    case 'cancelled':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

/**
 * Generate initials from name
 * @param {string} name - Full name
 * @returns {string} Initials
 */
export function getInitials(name) {
  if (!name) return '?';

  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
