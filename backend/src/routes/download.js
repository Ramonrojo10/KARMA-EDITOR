/**
 * Public Download Routes
 * No authentication required - for n8n access
 */

import express from 'express';
import fs from 'fs';
import { query } from '../config/database.js';

const router = express.Router();

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
