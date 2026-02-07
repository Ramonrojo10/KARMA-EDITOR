/**
 * YouTube Routes
 * Integration with YouTube Data API
 */

import express from 'express';
import axios from 'axios';
import { getSetting } from './settings.js';

const router = express.Router();

/**
 * Get YouTube credentials from DB or env vars
 */
async function getYouTubeCredentials() {
  // Try database first, then fall back to env vars
  const apiKey = await getSetting('youtube_api_key') || process.env.YOUTUBE_API_KEY;
  const channelId = await getSetting('youtube_channel_id') || process.env.YOUTUBE_CHANNEL_ID;

  console.log('📺 YouTube credentials check:');
  console.log('  - API Key from DB:', apiKey ? `***${apiKey.slice(-4)}` : 'not set');
  console.log('  - Channel ID from DB:', channelId || 'not set');

  return { apiKey, channelId };
}

/**
 * GET /api/youtube/videos
 * Fetch videos from YouTube channel
 */
router.get('/videos', async (req, res) => {
  try {
    const { apiKey, channelId } = await getYouTubeCredentials();

    if (!apiKey) {
      // Return mock data if no API key configured
      return res.json({
        videos: generateMockYouTubeData(),
        source: 'mock',
        message: 'Using mock data. Configure YouTube API Key in Settings.',
      });
    }

    const { maxResults = 20, pageToken } = req.query;

    // First, get the channel's upload playlist
    let uploadsPlaylistId = channelId;

    // If channel ID starts with UC, convert to uploads playlist (UU)
    if (channelId?.startsWith('UC')) {
      // Try to get the uploads playlist from the channels API
      console.log('📺 Getting uploads playlist for channel:', channelId);
      try {
        const channelResponse = await axios.get(
          `https://www.googleapis.com/youtube/v3/channels`, {
            params: {
              key: apiKey,
              id: channelId,
              part: 'contentDetails',
            },
          }
        );

        console.log('📺 Channel API response:', JSON.stringify(channelResponse.data, null, 2));

        if (channelResponse.data.items?.length > 0) {
          uploadsPlaylistId = channelResponse.data.items[0].contentDetails.relatedPlaylists.uploads;
          console.log('📺 Found uploads playlist:', uploadsPlaylistId);
        } else {
          // Fallback: convert UC to UU manually
          uploadsPlaylistId = 'UU' + channelId.substring(2);
          console.log('📺 No items in response, using manual conversion:', uploadsPlaylistId);
        }
      } catch (e) {
        console.error('Error getting channel info:', e.response?.data || e.message);
        // Fallback: convert UC to UU manually
        uploadsPlaylistId = 'UU' + channelId.substring(2);
        console.log('📺 Error occurred, using manual conversion:', uploadsPlaylistId);
      }
    }

    // Get videos from the uploads playlist
    const playlistResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlistItems`, {
        params: {
          key: apiKey,
          playlistId: uploadsPlaylistId,
          part: 'snippet,contentDetails',
          maxResults: parseInt(maxResults, 10),
          pageToken: pageToken || undefined,
        },
      }
    );

    const videoIds = playlistResponse.data.items
      .map(item => item.contentDetails.videoId)
      .join(',');

    // Get detailed video info (views, duration, etc.)
    let videoDetails = {};
    if (videoIds) {
      const detailsResponse = await axios.get(
        `https://www.googleapis.com/youtube/v3/videos`, {
          params: {
            key: apiKey,
            id: videoIds,
            part: 'statistics,contentDetails,status',
          },
        }
      );

      detailsResponse.data.items.forEach(item => {
        videoDetails[item.id] = {
          viewCount: parseInt(item.statistics.viewCount || 0, 10),
          likeCount: parseInt(item.statistics.likeCount || 0, 10),
          commentCount: parseInt(item.statistics.commentCount || 0, 10),
          duration: parseDuration(item.contentDetails.duration),
          privacyStatus: item.status.privacyStatus,
        };
      });
    }

    // Format response
    const videos = playlistResponse.data.items.map(item => {
      const videoId = item.contentDetails.videoId;
      const details = videoDetails[videoId] || {};

      return {
        id: videoId,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnailUrl: item.snippet.thumbnails?.maxres?.url
          || item.snippet.thumbnails?.high?.url
          || item.snippet.thumbnails?.medium?.url
          || item.snippet.thumbnails?.default?.url,
        publishedAt: item.snippet.publishedAt,
        channelTitle: item.snippet.channelTitle,
        viewCount: details.viewCount || 0,
        likeCount: details.likeCount || 0,
        commentCount: details.commentCount || 0,
        duration: details.duration || 0,
        privacyStatus: details.privacyStatus || 'unknown',
        tags: item.snippet.tags || [],
        youtubeUrl: `https://www.youtube.com/watch?v=${videoId}`,
        studioUrl: `https://studio.youtube.com/video/${videoId}/edit`,
      };
    });

    res.json({
      videos,
      nextPageToken: playlistResponse.data.nextPageToken,
      prevPageToken: playlistResponse.data.prevPageToken,
      totalResults: playlistResponse.data.pageInfo?.totalResults,
      source: 'youtube',
    });
  } catch (error) {
    console.error('❌ YouTube API error:', error.response?.data || error.message);
    console.error('   Full error:', JSON.stringify(error.response?.data, null, 2));

    // Return mock data on error
    res.json({
      videos: generateMockYouTubeData(),
      source: 'mock',
      error: error.response?.data?.error?.message || error.message,
    });
  }
});

/**
 * Parse ISO 8601 duration to seconds
 * @param {string} duration - Duration string like "PT4M13S"
 * @returns {number} Duration in seconds
 */
function parseDuration(duration) {
  if (!duration) return 0;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1] || 0, 10);
  const minutes = parseInt(match[2] || 0, 10);
  const seconds = parseInt(match[3] || 0, 10);

  return hours * 3600 + minutes * 60 + seconds;
}

/**
 * Generate mock YouTube data for demo purposes
 */
function generateMockYouTubeData() {
  const titles = [
    'Building a React Dashboard from Scratch',
    'Node.js Best Practices 2026',
    'Master PostgreSQL in 30 Minutes',
    'Video Editing Automation Tutorial',
    'The Ultimate n8n Workflow Guide',
    'Creating Stunning Thumbnails with AI',
  ];

  return titles.map((title, index) => ({
    id: `mock_video_${index + 1}`,
    title,
    description: `This is a demo video about ${title.toLowerCase()}. Configure your YouTube API key to see real videos.`,
    thumbnailUrl: `https://picsum.photos/seed/${index}/640/360`,
    publishedAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
    channelTitle: 'KARMA OPS',
    viewCount: Math.floor(Math.random() * 10000),
    likeCount: Math.floor(Math.random() * 500),
    commentCount: Math.floor(Math.random() * 50),
    duration: 300 + Math.floor(Math.random() * 1200),
    privacyStatus: index % 3 === 0 ? 'unlisted' : 'public',
    tags: ['tutorial', 'automation', 'karma-ops'],
    youtubeUrl: `https://www.youtube.com/watch?v=mock_${index}`,
    studioUrl: `https://studio.youtube.com/video/mock_${index}/edit`,
  }));
}

export default router;
