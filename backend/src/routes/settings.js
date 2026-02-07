/**
 * Settings Routes
 * API keys and configuration management
 */

import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// List of allowed setting keys (for security)
const ALLOWED_KEYS = [
  'youtube_api_key',
  'youtube_channel_id',
  'n8n_webhook_url',
];

/**
 * GET /api/settings
 * Get all settings (values are masked for API keys)
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(
      'SELECT key, value, encrypted, updated_at FROM settings'
    );

    // Mask sensitive values
    const settings = {};
    result.rows.forEach(row => {
      if (row.key.includes('api_key') || row.key.includes('secret')) {
        // Show only last 4 characters for sensitive data
        settings[row.key] = {
          value: row.value ? '***' + row.value.slice(-4) : null,
          hasValue: !!row.value,
          updatedAt: row.updated_at,
        };
      } else {
        settings[row.key] = {
          value: row.value,
          hasValue: !!row.value,
          updatedAt: row.updated_at,
        };
      }
    });

    res.json({ settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get settings',
    });
  }
});

/**
 * GET /api/settings/:key
 * Get a specific setting (for internal use, not masked)
 */
router.get('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({ error: 'Invalid setting key' });
    }

    const result = await query(
      'SELECT value FROM settings WHERE key = $1',
      [key]
    );

    if (result.rows.length === 0) {
      return res.json({ value: null });
    }

    res.json({ value: result.rows[0].value });
  } catch (error) {
    console.error('Get setting error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get setting',
    });
  }
});

/**
 * PUT /api/settings/:key
 * Save or update a setting
 */
router.put('/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({ error: 'Invalid setting key' });
    }

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    // Upsert the setting
    const result = await query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key)
       DO UPDATE SET value = $2, updated_at = NOW()
       RETURNING *`,
      [key, value]
    );

    console.log(`✅ Setting saved: ${key}`);

    res.json({
      success: true,
      message: `Setting ${key} saved successfully`,
      setting: {
        key: result.rows[0].key,
        hasValue: !!result.rows[0].value,
        updatedAt: result.rows[0].updated_at,
      },
    });
  } catch (error) {
    console.error('Save setting error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to save setting',
    });
  }
});

/**
 * DELETE /api/settings/:key
 * Delete a setting
 */
router.delete('/:key', async (req, res) => {
  try {
    const { key } = req.params;

    if (!ALLOWED_KEYS.includes(key)) {
      return res.status(400).json({ error: 'Invalid setting key' });
    }

    await query('DELETE FROM settings WHERE key = $1', [key]);

    console.log(`🗑️ Setting deleted: ${key}`);

    res.json({
      success: true,
      message: `Setting ${key} deleted successfully`,
    });
  } catch (error) {
    console.error('Delete setting error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete setting',
    });
  }
});

/**
 * POST /api/settings/youtube
 * Save YouTube API configuration (convenience endpoint)
 */
router.post('/youtube', async (req, res) => {
  try {
    const { apiKey, channelId } = req.body;

    if (!apiKey && !channelId) {
      return res.status(400).json({ error: 'At least one field is required' });
    }

    const results = [];

    if (apiKey) {
      await query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ('youtube_api_key', $1, NOW())
         ON CONFLICT (key)
         DO UPDATE SET value = $1, updated_at = NOW()`,
        [apiKey]
      );
      results.push('youtube_api_key');
    }

    if (channelId) {
      await query(
        `INSERT INTO settings (key, value, updated_at)
         VALUES ('youtube_channel_id', $1, NOW())
         ON CONFLICT (key)
         DO UPDATE SET value = $1, updated_at = NOW()`,
        [channelId]
      );
      results.push('youtube_channel_id');
    }

    console.log(`✅ YouTube settings saved: ${results.join(', ')}`);

    res.json({
      success: true,
      message: 'YouTube configuration saved successfully',
      saved: results,
    });
  } catch (error) {
    console.error('Save YouTube settings error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to save YouTube configuration',
    });
  }
});

/**
 * DELETE /api/settings/youtube
 * Delete all YouTube configuration
 */
router.delete('/youtube', async (req, res) => {
  try {
    await query(
      "DELETE FROM settings WHERE key IN ('youtube_api_key', 'youtube_channel_id')"
    );

    console.log('🗑️ YouTube settings deleted');

    res.json({
      success: true,
      message: 'YouTube configuration deleted successfully',
    });
  } catch (error) {
    console.error('Delete YouTube settings error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete YouTube configuration',
    });
  }
});

/**
 * Helper function to get a setting value (for use by other routes)
 */
export async function getSetting(key) {
  try {
    const result = await query(
      'SELECT value FROM settings WHERE key = $1',
      [key]
    );
    return result.rows.length > 0 ? result.rows[0].value : null;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return null;
  }
}

export default router;
