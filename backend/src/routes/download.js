/**
 * Public Routes for n8n
 * No authentication required - for n8n access
 */

import express from 'express';
import fs from 'fs';
import { query } from '../config/database.js';

const router = express.Router();

/**
 * PUT /api/download/:id/status
 * Update video status (callback from n8n)
 * No authentication required
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, progress, currentStep, youtubeUrl, error } = req.body;

    console.log(`📊 n8n callback for video ${id}:`, { status, progress, currentStep, youtubeUrl });

    // Validate status
    const validStatuses = ['pending', 'processing', 'completed', 'failed', 'published'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

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

    if (error) {
      updates.push(`error_message = $${paramIndex}`);
      values.push(error);
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(id);
    const updateQuery = `
      UPDATE videos
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Video not found' });
    }

    console.log(`✅ Video ${id} status updated to: ${status}`);

    res.json({
      success: true,
      video: result.rows[0],
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update video status',
    });
  }
});

/**
 * GET /api/download/:id
 * Download video file (for n8n to fetch)
 * No authentication required
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📥 n8n requesting download for video ${id}`);

    // Get video file path from database
    const result = await query(
      'SELECT file_path, original_filename, file_size FROM videos WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      console.log(`❌ Video ${id} not found in database`);
      return res.status(404).json({ error: 'Video not found' });
    }

    const { file_path, original_filename, file_size } = result.rows[0];

    // Check if file exists
    if (!file_path || !fs.existsSync(file_path)) {
      console.log(`❌ Video file not found on disk: ${file_path}`);
      return res.status(404).json({ error: 'Video file not found on disk' });
    }

    console.log(`✅ Streaming video ${id}: ${original_filename} (${file_size} bytes)`);

    // Set headers for binary download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${original_filename}"`);
    if (file_size) {
      res.setHeader('Content-Length', file_size);
    }

    // Stream the file
    const fileStream = fs.createReadStream(file_path);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File stream error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error streaming file' });
      }
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to download video',
    });
  }
});

export default router;
