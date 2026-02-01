/**
 * Database Seed Script
 * Creates default user and sample data
 */

import bcrypt from 'bcryptjs';
import { query } from './config/database.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../.env' });
dotenv.config();

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // Create default user
    const passwordHash = await bcrypt.hash('karma2024', 10);

    const userResult = await query(
      `INSERT INTO users (username, password_hash)
       VALUES ($1, $2)
       ON CONFLICT (username) DO UPDATE SET password_hash = $2
       RETURNING id, username`,
      ['kevin', passwordHash]
    );

    const user = userResult.rows[0];
    console.log(`✓ Created/updated user: ${user.username} (ID: ${user.id})`);

    // Create sample videos
    const sampleVideos = [
      {
        title: 'Introduction to KARMA OPS',
        status: 'completed',
        file_size: 150000000,
        duration: 845,
        youtube_id: 'demo_001',
        youtube_url: 'https://youtube.com/watch?v=demo_001',
        thumbnail_url: 'https://picsum.photos/seed/1/640/360',
      },
      {
        title: 'Advanced Video Editing Tips',
        status: 'completed',
        file_size: 250000000,
        duration: 1234,
        youtube_id: 'demo_002',
        youtube_url: 'https://youtube.com/watch?v=demo_002',
        thumbnail_url: 'https://picsum.photos/seed/2/640/360',
      },
      {
        title: 'Creating AI Thumbnails',
        status: 'processing',
        file_size: 180000000,
        duration: 567,
        progress: 65,
        current_step: 'generating_thumbnail',
      },
      {
        title: 'Workflow Automation Guide',
        status: 'completed',
        file_size: 320000000,
        duration: 2100,
        youtube_id: 'demo_003',
        youtube_url: 'https://youtube.com/watch?v=demo_003',
        thumbnail_url: 'https://picsum.photos/seed/3/640/360',
      },
      {
        title: 'n8n Integration Tutorial',
        status: 'failed',
        file_size: 95000000,
        duration: 480,
      },
    ];

    for (const video of sampleVideos) {
      await query(
        `INSERT INTO videos (
          user_id, title, status, file_size, duration,
          youtube_id, youtube_url, thumbnail_url,
          progress, current_step,
          created_at, completed_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        ON CONFLICT DO NOTHING`,
        [
          user.id,
          video.title,
          video.status,
          video.file_size,
          video.duration,
          video.youtube_id || null,
          video.youtube_url || null,
          video.thumbnail_url || null,
          video.progress || (video.status === 'completed' ? 100 : 0),
          video.current_step || (video.status === 'completed' ? 'complete' : 'failed'),
          new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          video.status === 'completed' ? new Date() : null,
        ]
      );
    }

    console.log(`✓ Created ${sampleVideos.length} sample videos`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('   Username: kevin');
    console.log('   Password: karma2024');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
