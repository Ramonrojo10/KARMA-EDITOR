/**
 * Authentication Routes
 * Login, logout, and session management
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken, authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/auth/login
 * Authenticate user with username and password
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    console.log(`🔐 Login attempt for user: ${username}`);

    // Validate input
    if (!username || !password) {
      console.log('❌ Missing credentials');
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Username and password are required',
      });
    }

    // Find user by username
    console.log('📦 Querying database for user...');
    const result = await query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      [username.toLowerCase().trim()]
    );

    console.log(`📦 Query returned ${result.rows.length} rows`);

    if (result.rows.length === 0) {
      console.log(`❌ User not found: ${username}`);
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password',
      });
    }

    const user = result.rows[0];
    console.log(`✅ User found: ${user.username} (ID: ${user.id})`);
    console.log(`📋 Password hash from DB: ${user.password_hash}`);
    console.log(`📋 Password hash length: ${user.password_hash?.length}`);
    console.log(`📋 Password hash type: ${typeof user.password_hash}`);

    // Verify password
    console.log('🔑 Verifying password...');
    console.log(`🔑 Input password: "${password}" (length: ${password?.length})`);

    // Trim password hash in case of whitespace issues
    const cleanHash = user.password_hash?.trim();

    let isValidPassword = false;
    try {
      isValidPassword = await bcrypt.compare(password, cleanHash);
      console.log(`🔑 bcrypt.compare result: ${isValidPassword}`);
    } catch (bcryptError) {
      console.error('🔑 bcrypt.compare error:', bcryptError.message);
    }

    if (!isValidPassword) {
      console.log('❌ Invalid password');

      // Debug: Test bcrypt functionality
      console.log('🔍 Debug: Testing bcrypt functionality...');
      try {
        const testHash = await bcrypt.hash('karma2024', 10);
        console.log(`🔍 Fresh hash for "karma2024": ${testHash}`);
        const testCompare = await bcrypt.compare('karma2024', testHash);
        console.log(`🔍 Fresh hash compare result: ${testCompare}`);

        // Try comparing with the expected hash
        const expectedHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
        const expectedCompare = await bcrypt.compare('karma2024', expectedHash);
        console.log(`🔍 Expected hash compare result: ${expectedCompare}`);
      } catch (debugError) {
        console.error('🔍 Debug error:', debugError.message);
      }

      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid username or password',
      });
    }

    // Generate JWT token
    console.log('🎫 Generating JWT token...');
    const token = generateToken({
      id: user.id,
      username: user.username,
    });

    // Set httpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    console.log(`✅ Login successful for user: ${user.username}`);

    // Return user info (without password)
    res.json({
      success: true,
      token, // Also send token in response for API clients
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('❌ Login error:', error.message);
    console.error('Stack:', error.stack);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to authenticate',
      details: process.env.NODE_ENV !== 'production' ? error.message : undefined,
    });
  }
});

/**
 * POST /api/auth/logout
 * Clear authentication cookie
 */
router.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, username, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to get user info',
    });
  }
});

/**
 * PUT /api/auth/password
 * Change user password
 */
router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Current password and new password are required',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Invalid password',
        message: 'New password must be at least 6 characters',
      });
    }

    // Get current user's password hash
    const userResult = await query(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user.id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, userResult.rows[0].password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [newHash, req.user.id]
    );

    res.json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to change password',
    });
  }
});

/**
 * GET /api/auth/debug
 * Debug endpoint to test database and bcrypt
 * WARNING: Remove in production!
 */
router.get('/debug', async (req, res) => {
  try {
    console.log('🔧 Running auth debug...');

    // Test database connection
    const dbTest = await query('SELECT NOW() as now');
    console.log('✅ Database connected:', dbTest.rows[0].now);

    // Get user from database
    const userResult = await query(
      'SELECT id, username, password_hash FROM users WHERE username = $1',
      ['kevin']
    );

    if (userResult.rows.length === 0) {
      return res.json({
        success: false,
        error: 'User "kevin" not found in database',
        suggestion: 'Run: npm run seed',
      });
    }

    const user = userResult.rows[0];
    const storedHash = user.password_hash;

    // Test bcrypt with the stored hash
    const testPassword = 'karma2024';
    const compareResult = await bcrypt.compare(testPassword, storedHash);

    // Generate a fresh hash for comparison
    const freshHash = await bcrypt.hash(testPassword, 10);
    const freshCompare = await bcrypt.compare(testPassword, freshHash);

    // Test with the expected hash
    const expectedHash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
    const expectedCompare = await bcrypt.compare(testPassword, expectedHash);

    res.json({
      success: true,
      database: {
        connected: true,
        timestamp: dbTest.rows[0].now,
      },
      user: {
        id: user.id,
        username: user.username,
        hashLength: storedHash?.length,
        hashPreview: storedHash?.substring(0, 20) + '...',
      },
      bcryptTests: {
        storedHashWorks: compareResult,
        freshHashWorks: freshCompare,
        expectedHashWorks: expectedCompare,
      },
      recommendation: compareResult
        ? 'Authentication should work. Check if password is being sent correctly.'
        : 'Hash mismatch. Run "npm run seed" to reset the password.',
    });
  } catch (error) {
    console.error('Debug error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack,
    });
  }
});

export default router;
