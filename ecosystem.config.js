/**
 * PM2 Ecosystem Configuration
 * Production process management
 */

module.exports = {
  apps: [
    {
      name: 'karma-ops-editor',
      cwd: './backend',
      script: 'src/index.js',
      instances: 1, // Use 1 for simplicity with ES modules
      exec_mode: 'fork', // Fork mode required for ES modules
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'development',
        PORT: 4000,
        DATABASE_URL: 'postgres://postgres:ckTdIVsSlCLZq5HGWDTudzhkweN2sWEuXVgiOgyORL1gEWe57dPK7hhwKbhHl0Hc@localhost:5432/karma_editing',
        JWT_SECRET: 'karma-ops-super-secret-jwt-key-change-in-production',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4000,
        // Set these in your production environment or .env file:
        // DATABASE_URL: 'postgres://...',
        // JWT_SECRET: 'your-production-secret',
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_file: './logs/combined.log',
      time: true,
      merge_logs: true,
    },
  ],
};
