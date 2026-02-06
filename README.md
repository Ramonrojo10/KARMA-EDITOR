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

## Coolify Deployment

This section explains how to deploy KARMA OPS EDITOR to Coolify.

### Deployment Strategy

**Recommended: Deploy as a single application** with both frontend and backend in one container. This simplifies deployment and networking.

### Step 1: Create Application in Coolify

1. In Coolify dashboard, create a new **Application**
2. Select **Git** as the source
3. Connect your GitHub repository
4. Select the branch: `claude/karma-ops-editor-dashboard-ACawi`

### Step 2: Configure Build Settings

**Build Pack**: Nixpacks (recommended) or Dockerfile

**Build Command**:
```bash
cd frontend && npm install && npm run build && cd ../backend && npm install
```

**Start Command**:
```bash
cd backend && node src/index.js
```

**Base Directory**: `/` (root of repository)

### Step 3: Environment Variables

Add these environment variables in Coolify:

| Variable | Value | Required |
|----------|-------|----------|
| `DATABASE_URL` | `postgres://postgres:PASSWORD@POSTGRES_CONTAINER:5432/karma_editing` | Yes |
| `JWT_SECRET` | `your-secure-random-string-min-32-chars` | Yes |
| `NODE_ENV` | `production` | Yes |
| `PORT` | `4000` | Yes |
| `N8N_WEBHOOK_URL` | `https://n8n2.0.karmaops.online/webhook/video-upload` | Yes |
| `FRONTEND_URL` | `https://your-domain.com` | Yes |
| `YOUTUBE_API_KEY` | Your YouTube API key | Optional |
| `YOUTUBE_CHANNEL_ID` | Your channel ID | Optional |
| `UPLOAD_DIR` | `/tmp/uploads` | Optional |

**Important Database URL Notes**:
- Use the **internal Docker hostname** of your PostgreSQL container (e.g., `tcc0w08s8wsokww80oc84gkw`)
- SSL is **disabled** in this application
- Example: `postgres://postgres:ckTdIVsSlCLZq5HGWDTudzhkweN2sWEuXVgiOgyORL1gEWe57dPK7hhwKbhHl0Hc@tcc0w08s8wsokww80oc84gkw:5432/karma_editing`

### Step 4: Configure Ports

- **Exposed Port**: `4000`
- **Public Port**: `80` or `443` (with SSL)

### Step 5: Database Setup

If you haven't set up the database:

1. Connect to your PostgreSQL container
2. Create the database: `CREATE DATABASE karma_editing;`
3. Run the schema:
   ```bash
   psql -d karma_editing -f database/schema.sql
   ```

Or use Coolify's terminal to execute:
```sql
-- Connect to karma_editing database and run:
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  youtube_id VARCHAR(50),
  youtube_url VARCHAR(255),
  thumbnail_url TEXT,
  description TEXT,
  tags TEXT[],
  status VARCHAR(50) DEFAULT 'processing',
  n8n_execution_id VARCHAR(100),
  file_size BIGINT,
  duration INTEGER,
  file_path TEXT,
  original_filename VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress INTEGER DEFAULT 0,
  current_step VARCHAR(100) DEFAULT 'uploading'
);

CREATE TABLE IF NOT EXISTS executions (
  id SERIAL PRIMARY KEY,
  video_id INTEGER REFERENCES videos(id) ON DELETE CASCADE,
  status VARCHAR(50),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Insert default user (password: karma2024)
INSERT INTO users (username, password_hash)
VALUES ('kevin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy')
ON CONFLICT (username) DO NOTHING;
```

### Step 6: Configure Domain & SSL

1. Add your domain in Coolify's application settings
2. Enable **Let's Encrypt** for automatic SSL
3. Configure the proxy to forward requests correctly

### Step 7: Health Check

Configure health check endpoint:
- **Path**: `/api/health`
- **Port**: `4000`
- **Interval**: `30s`

### Alternative: Dockerfile Deployment

If you prefer using a Dockerfile, create this at the project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY frontend/package*.json ./frontend/
COPY backend/package*.json ./backend/

# Install dependencies
RUN cd frontend && npm ci
RUN cd backend && npm ci

# Copy source files
COPY frontend ./frontend
COPY backend ./backend

# Build frontend
RUN cd frontend && npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy backend
COPY --from=builder /app/backend ./backend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Create upload directory
RUN mkdir -p /tmp/uploads

WORKDIR /app/backend

EXPOSE 4000

CMD ["node", "src/index.js"]
```

### Post-Deployment Verification

1. Check application logs in Coolify for:
   ```
   ✅ Database connected: karma_editing
   🎬 KARMA OPS EDITOR - Backend Server
   ```

2. Test the health endpoint:
   ```bash
   curl https://your-domain.com/api/health
   ```

3. Try logging in with:
   - Username: `kevin`
   - Password: `karma2024`

### Troubleshooting Coolify Deployment

**Database connection fails**:
- Verify the PostgreSQL container is running
- Check the DATABASE_URL uses the correct internal hostname
- Ensure the database `karma_editing` exists
- SSL must be disabled (it's disabled by default in this app)

**Login fails**:
- Check application logs for database connection status
- Verify the users table has the kevin user
- Ensure JWT_SECRET is set

**Frontend not loading**:
- Verify the build completed successfully
- Check that `frontend/dist` exists
- Ensure NODE_ENV=production

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
