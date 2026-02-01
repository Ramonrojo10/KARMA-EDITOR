/**
 * Stats Routes
 * Dashboard statistics and analytics
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get dashboard statistics for current user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    // Run all queries in parallel for performance
    const [
      totalVideosResult,
      videosThisMonthResult,
      totalStorageResult,
      chartDataResult,
      recentVideosResult,
      statusCountsResult,
    ] = await Promise.all([
      // Total videos
      query(
        `SELECT COUNT(*) as count FROM videos WHERE user_id = $1`,
        [userId]
      ),

      // Videos this month
      query(
        `SELECT COUNT(*) as count FROM videos
         WHERE user_id = $1
         AND created_at >= date_trunc('month', CURRENT_DATE)`,
        [userId]
      ),

      // Total storage used (in bytes)
      query(
        `SELECT COALESCE(SUM(file_size), 0) as total FROM videos WHERE user_id = $1`,
        [userId]
      ),

      // Videos per day for last 30 days (for chart)
      query(
        `SELECT
          date_trunc('day', created_at)::date as date,
          COUNT(*) as count
        FROM videos
        WHERE user_id = $1
          AND created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY date_trunc('day', created_at)::date
        ORDER BY date ASC`,
        [userId]
      ),

      // Recent videos
      query(
        `SELECT id, title, status, created_at, thumbnail_url
         FROM videos
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [userId]
      ),

      // Videos by status
      query(
        `SELECT status, COUNT(*) as count
         FROM videos
         WHERE user_id = $1
         GROUP BY status`,
        [userId]
      ),
    ]);

    // Calculate processing time saved (estimate: 30 min per completed video)
    const completedVideosResult = await query(
      `SELECT COUNT(*) as count FROM videos
       WHERE user_id = $1 AND status = 'completed'`,
      [userId]
    );
    const completedCount = parseInt(completedVideosResult.rows[0].count, 10);
    const processingTimeSavedHours = Math.round(completedCount * 0.5 * 10) / 10; // 30 min each

    // Format storage (bytes to GB)
    const storageBytes = parseInt(totalStorageResult.rows[0].total, 10) || 0;
    const storageGB = Math.round((storageBytes / (1024 * 1024 * 1024)) * 100) / 100;

    // Fill in missing days for chart
    const chartData = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const existingData = chartDataResult.rows.find(
        row => row.date.toISOString().split('T')[0] === dateStr
      );

      chartData.push({
        date: dateStr,
        count: existingData ? parseInt(existingData.count, 10) : 0,
      });
    }

    // Format status counts
    const statusCounts = {
      processing: 0,
      completed: 0,
      failed: 0,
    };
    statusCountsResult.rows.forEach(row => {
      if (statusCounts.hasOwnProperty(row.status)) {
        statusCounts[row.status] = parseInt(row.count, 10);
      }
    });

    res.json({
      stats: {
        totalVideos: parseInt(totalVideosResult.rows[0].count, 10),
        videosThisMonth: parseInt(videosThisMonthResult.rows[0].count, 10),
        processingTimeSavedHours,
        storageUsedGB: storageGB,
        statusCounts,
      },
      chartData,
      recentVideos: recentVideosResult.rows,
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch statistics',
    });
  }
});

/**
 * GET /api/stats/export
 * Export history as CSV
 */
router.get('/export', async (req, res) => {
  try {
    const result = await query(
      `SELECT
        id, title, youtube_id, youtube_url, status,
        file_size, duration, original_filename,
        created_at, completed_at
      FROM videos
      WHERE user_id = $1
      ORDER BY created_at DESC`,
      [req.user.id]
    );

    // Build CSV
    const headers = [
      'ID', 'Title', 'YouTube ID', 'YouTube URL', 'Status',
      'File Size (bytes)', 'Duration (seconds)', 'Original Filename',
      'Created At', 'Completed At'
    ];

    let csv = headers.join(',') + '\n';

    result.rows.forEach(row => {
      const values = [
        row.id,
        `"${(row.title || '').replace(/"/g, '""')}"`,
        row.youtube_id || '',
        row.youtube_url || '',
        row.status,
        row.file_size || '',
        row.duration || '',
        `"${(row.original_filename || '').replace(/"/g, '""')}"`,
        row.created_at ? new Date(row.created_at).toISOString() : '',
        row.completed_at ? new Date(row.completed_at).toISOString() : '',
      ];
      csv += values.join(',') + '\n';
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=karma-ops-history-${Date.now()}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to export data',
    });
  }
});

export default router;
