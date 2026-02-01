# KARMA OPS EDITOR

A modern video editing automation dashboard built with React, Express, and PostgreSQL. Upload videos for automatic processing and publishing to YouTube.

![KARMA OPS EDITOR](https://via.placeholder.com/800x400/000000/8B5CF6?text=KARMA+OPS+EDITOR)

## Features

- **Modern Dashboard**: Clean, dark-themed UI with purple/gold accents
- **Video Upload**: Drag & drop video upload with progress tracking
- **Automated Processing**: Integration with n8n for automated video editing workflow
- **YouTube Integration**: Automatic publishing and video management
- **Real-time Status**: Live processing status with step-by-step progress
- **History & Analytics**: Track all processed videos with statistics
- **Secure Authentication**: JWT-based authentication with httpOnly cookies

## Tech Stack

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Authentication**: JWT + bcrypt
- **File Upload**: Multer

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn
- PM2 (for production)

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/karma-ops-editor.git
cd karma-ops-editor
```

### 2. Install dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Database Setup

Create a PostgreSQL database and run the schema:

```bash
# Create database
createdb karma_editing

# Run schema
psql -d karma_editing -f database/schema.sql
```

### 4. Environment Configuration

Copy the example environment file and configure:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/karma_editing

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key-here

# n8n Webhook
N8N_WEBHOOK_URL=https://n8n2.0.karmaops.online/webhook/video-upload

# YouTube API (optional, for YouTube Studio view)
YOUTUBE_API_KEY=your-youtube-api-key
YOUTUBE_CHANNEL_ID=your-channel-id

# Server
PORT=4000
NODE_ENV=production
```

### 5. Seed Default User

```bash
cd backend
npm run seed
```

This creates the default user:
- Username: `kevin`
- Password: `karma2024`

## Development

Start both frontend and backend in development mode:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

The frontend runs on `http://localhost:3000` and proxies API requests to `http://localhost:4000`.

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

### Start with PM2

```bash
# From project root
pm2 start ecosystem.config.js --env production
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend static files
    root /path/to/karma-ops-editor/frontend/dist;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;

        # For file uploads
        client_max_body_size 500M;
        proxy_request_buffering off;
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |
| POST | `/api/auth/logout` | Logout and clear session |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/password` | Change password |

### Videos

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/videos` | List all videos |
| GET | `/api/videos/:id` | Get video details |
| GET | `/api/videos/:id/status` | Get processing status |
| POST | `/api/videos` | Upload new video |
| PUT | `/api/videos/:id/status` | Update status (n8n webhook) |
| DELETE | `/api/videos/:id` | Delete video |
| POST | `/api/videos/:id/cancel` | Cancel processing |

### Stats

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/stats` | Get dashboard statistics |
| GET | `/api/stats/export` | Export history as CSV |

### YouTube

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/youtube/videos` | Get YouTube channel videos |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+U` | Go to Upload page |
| `Ctrl+H` | Go to History page |
| `Esc` | Close modal dialogs |

## n8n Webhook Integration

The video upload triggers a webhook to your n8n instance:

```json
POST https://n8n2.0.karmaops.online/webhook/video-upload
{
  "videoPath": "/tmp/uploads/1706745600_abc123_video.mp4",
  "videoId": "123",
  "userId": 1,
  "filename": "video.mp4",
  "fileSize": 150000000
}
```

n8n should call back to update status:

```json
PUT /api/videos/:id/status
{
  "status": "processing",
  "progress": 50,
  "currentStep": "transcribing",
  "youtubeUrl": "https://youtube.com/watch?v=xxx",
  "youtubeId": "xxx",
  "thumbnailUrl": "https://..."
}
```

## Project Structure

```
karma-ops-editor/
├── frontend/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   └── utils/          # Utility functions
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── config/         # Database config
│   │   ├── middleware/     # Auth & upload middleware
│   │   └── routes/         # API routes
│   └── package.json
├── database/
│   └── schema.sql
├── .env.example
├── ecosystem.config.js
└── README.md
```

## Troubleshooting

### Database Connection Issues

Ensure PostgreSQL is running and the DATABASE_URL is correct:

```bash
psql -h localhost -U postgres -d karma_editing
```

### Upload Failures

- Check `/tmp/uploads` directory exists and is writable
- Verify file size is under 500MB
- Ensure proper MIME types (mp4, mov, avi)

### n8n Webhook Errors

- Verify the N8N_WEBHOOK_URL is accessible
- Check n8n workflow is active and properly configured

## License

MIT License - see LICENSE file for details.

## Support

For issues and feature requests, please create an issue on GitHub.

---

**Built with love by KARMA OPS**
