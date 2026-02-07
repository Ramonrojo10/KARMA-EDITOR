/**
 * Video Routes
 * Upload, list, and manage video processing
 */

import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/database.js';
import { uploadVideo, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'https://n8n2.0.karmaops.online/webhook/video-upload';
const BACKEND_URL = process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:4000';

/**
 * GET /api/videos
 * List all videos for current user
 */
router.get('/', async (req, res) => {
  try {
    const {
      status,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    let whereClause = 'WHERE user_id = $1';
    const params = [req.user.id];
    let paramIndex = 2;

    // Filter by status
    if (status && status !== 'all') {
      whereClause += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    // Search by title
    if (search) {
      whereClause += ` AND (title ILIKE $${paramIndex} OR original_filename ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    // Validate sort column
    const allowedSortColumns = ['created_at', 'title', 'duration', 'status', 'file_size'];
    const sortColumn = allowedSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM videos ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Calculate offset
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get paginated results
    const result = await query(
      `SELECT
        id, title, youtube_id, youtube_url, thumbnail_url,
        description, tags, status, file_size, duration,
        original_filename, progress, current_step,
        created_at, completed_at
      FROM videos
      ${whereClause}
      ORDER BY ${sortColumn} ${order}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
      [...params, parseInt(limit, 10), offset]
    );

    res.json({
      videos: result.rows,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        totalPages: Math.ceil(total / parseInt(limit, 10)),
      },
    });
  } catch (error) {
    console.error('List videos error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch videos',
    });
  }
});

/**
 * GET /api/videos/:id
 * Get single video with execution details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const videoResult = await query(
      `SELECT v.*,
        json_agg(json_build_object(
          'id', e.id,
          'status', e.status,
          'started_at', e.started_at,
          'completed_at', e.completed_at,
          'error_message', e.error_message
        )) FILTER (WHERE e.id IS NOT NULL) as executions
      FROM videos v
      LEFT JOIN executions e ON e.video_id = v.id
      WHERE v.id = $1 AND v.user_id = $2
      GROUP BY v.id`,
      [id, req.user.id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ video: videoResult.rows[0] });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch video',
    });
  }
});

/**
 * GET /api/videos/:id/status
 * Get processing status for a video
 */
router.get('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT id, status, progress, current_step, youtube_url,
              n8n_execution_id, created_at, completed_at
       FROM videos
       WHERE id = $1 AND user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json({ status: result.rows[0] });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to fetch status',
    });
  }
});

/**
 * POST /api/upload
 * Upload a video file and trigger n8n workflow
 */
router.post('/', uploadVideo, handleUploadError, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a video file to upload',
      });
    }

    const { title, description, tags } = req.body;
    const file = req.file;

    // Create video record in database
    const videoResult = await query(
      `INSERT INTO videos (
        user_id, title, description, tags, status,
        file_size, file_path, original_filename,
        progress, current_step
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        req.user.id,
        title || file.originalname.replace(/\.[^/.]+$/, ''),
        description || '',
        tags ? tags.split(',').map(t => t.trim()) : [],
        'processing',
        file.size,
        file.path,
        file.originalname,
        5,
        'uploading',
      ]
    );

    const videoId = videoResult.rows[0].id;

    // Create initial execution record
    await query(
      `INSERT INTO executions (video_id, status, started_at)
       VALUES ($1, 'started', NOW())`,
      [videoId]
    );

    // Trigger n8n webhook with video metadata and download URL
    try {
      // Build the download URL for n8n to fetch the video
      const downloadUrl = `${BACKEND_URL}/api/download/${videoId}`;

      console.log('📤 Sending webhook to n8n:', N8N_WEBHOOK_URL);
      console.log('📁 File path:', file.path);
      console.log('📊 File size:', file.size);
      console.log('🔗 Download URL:', downloadUrl);

      // Send JSON with video metadata and download URL
      const webhookPayload = {
        videoId: videoId.toString(),
        userId: req.user.id.toString(),
        filename: file.originalname,
        fileSize: file.size,
        title: title || file.originalname.replace(/\.[^/.]+$/, ''),
        mimeType: file.mimetype || 'video/mp4',
        downloadUrl: downloadUrl,
        filePath: file.path, // Local path on server (if n8n is on same server)
        callbackUrl: `${BACKEND_URL}/api/videos/${videoId}/status`,
      };

      const webhookResponse = await axios.post(N8N_WEBHOOK_URL, webhookPayload, {
        timeout: 30000, // 30 seconds for webhook trigger
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Update with n8n execution ID if returned
      if (webhookResponse.data?.executionId) {
        await query(
          `UPDATE videos SET n8n_execution_id = $1 WHERE id = $2`,
          [webhookResponse.data.executionId, videoId]
        );
      }

      console.log('✅ n8n webhook triggered successfully:', webhookResponse.status);
      console.log('📦 n8n response:', JSON.stringify(webhookResponse.data));
    } catch (webhookError) {
      console.error('❌ n8n webhook error:', webhookError.message);
      if (webhookError.response) {
        console.error('❌ n8n response status:', webhookError.response.status);
        console.error('❌ n8n response data:', webhookError.response.data);
      }
      // Don't fail the upload, just log the error
      // The video is still saved and can be retried
    }

    res.status(201).json({
      success: true,
      videoId,
      status: 'processing',
      message: 'Video uploaded and processing started',
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      error: 'Upload failed',
      message: 'Failed to upload video',
    });
  }
});

/**
 * PUT /api/videos/:id/status
 * Update video processing status (called by n8n webhook)
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, currentStep, youtubeUrl, youtubeId, thumbnailUrl, error } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramIndex = 1;

    if (status) {
      updates.push(`status = $${paramIndex}`);
      values.push(status);
      paramIndex++;
    }
    if (progress !== undefined) {
      updates.push(`progress = $${paramIndex}`);
      values.push(progress);
      paramIndex++;
    }
    if (currentStep) {
      updates.push(`current_step = $${paramIndex}`);
      values.push(currentStep);
      paramIndex++;
    }
    if (youtubeUrl) {
      updates.push(`youtube_url = $${paramIndex}`);
      values.push(youtubeUrl);
      paramIndex++;
    }
    if (youtubeId) {
      updates.push(`youtube_id = $${paramIndex}`);
      values.push(youtubeId);
      paramIndex++;
    }
    if (thumbnailUrl) {
      updates.push(`thumbnail_url = $${paramIndex}`);
      values.push(thumbnailUrl);
      paramIndex++;
    }
    if (status === 'completed') {
      updates.push(`completed_at = NOW()`);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No updates provided' });
    }

    values.push(id);
    await query(
      `UPDATE videos SET ${updates.join(', ')} WHERE id = $${paramIndex}`,
      values
    );

    // Update execution record
    if (status === 'completed' || status === 'failed') {
      await query(
        `UPDATE executions
         SET status = $1, completed_at = NOW(), error_message = $2
         WHERE video_id = $3`,
        [status, error || null, id]
      );
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update status',
    });
  }
});

/**
 * DELETE /api/videos/:id
 * Delete a video
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get file path before deleting
    const videoResult = await query(
      'SELECT file_path FROM videos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete from database (cascades to executions)
    await query('DELETE FROM videos WHERE id = $1', [id]);

    // Delete file if exists
    const filePath = videoResult.rows[0].file_path;
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete video',
    });
  }
});

/**
 * POST /api/videos/:id/cancel
 * Cancel video processing
 */
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;

    // Get video
    const videoResult = await query(
      'SELECT n8n_execution_id, status FROM videos WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (videoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    if (videoResult.rows[0].status !== 'processing') {
      return res.status(400).json({ error: 'Video is not processing' });
    }

    // Try to cancel n8n execution
    const executionId = videoResult.rows[0].n8n_execution_id;
    if (executionId) {
      try {
        await axios.delete(`${N8N_WEBHOOK_URL}/cancel/${executionId}`);
      } catch (e) {
        // Ignore cancellation errors
        console.error('n8n cancel error:', e.message);
      }
    }

    // Update status to failed
    await query(
      `UPDATE videos SET status = 'failed', current_step = 'cancelled' WHERE id = $1`,
      [id]
    );

    await query(
      `UPDATE executions SET status = 'cancelled', completed_at = NOW(),
       error_message = 'Cancelled by user' WHERE video_id = $1`,
      [id]
    );

    res.json({
      success: true,
      message: 'Processing cancelled',
    });
  } catch (error) {
    console.error('Cancel error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to cancel processing',
    });
  }
});

export default router;
