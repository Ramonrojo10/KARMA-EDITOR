/**
 * PostgreSQL Database Configuration
 */

import pg from 'pg';
import dotenv from 'dotenv';

// Load environment variables from multiple locations
dotenv.config({ path: '../../.env' });
dotenv.config({ path: '../.env' });
dotenv.config();

const { Pool } = pg;

// Default connection string (fallback if DATABASE_URL not set)
const DEFAULT_DATABASE_URL = 'postgres://postgres:ckTdIVsSlCLZq5HGWDTudzhkweN2sWEuXVgiOgyORL1gEWe57dPK7hhwKbhHl0Hc@localhost:5432/karma_editing';

// Get database URL from environment or use default
const databaseUrl = process.env.DATABASE_URL || DEFAULT_DATABASE_URL;

console.log('🔧 Database Configuration:');
console.log(`   URL: ${databaseUrl.replace(/:[^:@]+@/, ':****@')}`); // Log URL with hidden password

// Create connection pool - SSL is DISABLED (database doesn't support it)
const pool = new Pool({
  connectionString: databaseUrl,
  ssl: false, // SSL disabled - database doesn't support it
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000, // Increased timeout
});

// Test connection on startup
pool.on('connect', () => {
  console.log('📦 Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('❌ Unexpected database error:', err.message);
  // Don't exit immediately - allow reconnection attempts
});

/**
 * Test database connection
 * @returns {Promise<boolean>} True if connection successful
 */
export const testConnection = async () => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log(`✅ Database connected: ${result.rows[0].db} at ${result.rows[0].now}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

/**
 * Execute a query with parameters
 * @param {string} text - SQL query string
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
export const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production') {
      console.log('Executed query', { text: text.substring(0, 100), duration, rows: result.rowCount });
    }
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * @returns {Promise} Pool client
 */
export const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = () => {
    client.release();
  };

  // Set a timeout of 5 seconds to release the client
  const timeout = setTimeout(() => {
    console.error('A client has been checked out for more than 5 seconds!');
  }, 5000);

  return {
    query,
    release: () => {
      clearTimeout(timeout);
      release();
    },
  };
};

export default pool;
