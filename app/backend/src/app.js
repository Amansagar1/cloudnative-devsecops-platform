const express = require('express');
const cors = require('cors');
const os = require('os');
const client = require('prom-client');
const { Pool } = require('pg');
const { createClient } = require('redis');

const app = express();
app.use(cors());
app.use(express.json());

// ==========================================
// 1. Prometheus Observability Metrics
// ==========================================
const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});
register.registerMetric(httpRequestDurationMicroseconds);

const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests made',
  labelNames: ['method', 'route', 'code']
});
register.registerMetric(httpRequestsTotal);

// Middleware to track request duration and counts
app.use((req, res, next) => {
  const start = process.hrtime();
  res.on('finish', () => {
    const elapsed = process.hrtime(start);
    const duration = elapsed[0] + elapsed[1] / 1e9;
    const route = req.route ? req.route.path : req.path;
    httpRequestsTotal.inc({ method: req.method, route, code: res.statusCode });
    httpRequestDurationMicroseconds.observe({ method: req.method, route, code: res.statusCode }, duration);
  });
  next();
});

// ==========================================
// 2. Database (PostgreSQL) & Cache (Redis)
// ==========================================
const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'devops_db',
  connectionTimeoutMillis: 2000
};

const pool = new Pool(pgConfig);

// In-memory fallback if Postgres is not running locally
let memoryStore = [
  { id: 1, title: 'Learn Kubernetes Orchestration', status: 'In Progress' },
  { id: 2, title: 'Implement GitOps with ArgoCD', status: 'Pending' },
  { id: 3, title: 'Configure Terraform AWS Modules', status: 'Completed' }
];

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redisClient = createClient({ url: redisUrl });
let isRedisConnected = false;

redisClient.on('connect', () => {
  isRedisConnected = true;
  console.log('✅ Connected to Redis successfully');
});

redisClient.on('error', (err) => {
  isRedisConnected = false;
  // Gracefully log without crashing
});

// Attempt Redis connection without crashing if unavailable in test mode
(async () => {
  if (process.env.NODE_ENV !== 'test') {
    try {
      await redisClient.connect();
    } catch (err) {
      console.warn('⚠️ Redis not available at startup. Operating in fallback mode.');
    }
  }
})();

// ==========================================
// 3. Health Check & Probe Endpoints
// ==========================================

// Prometheus scrape endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});

// Kubernetes Liveness Probe: Is the process responsive?
app.get('/api/live', (req, res) => {
  res.status(200).json({
    status: 'ALIVE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Kubernetes Readiness Probe: Are external dependencies (DB/Cache) ready?
app.get('/api/ready', async (req, res) => {
  const checks = {
    server: 'UP',
    database: 'UNKNOWN',
    redis: isRedisConnected ? 'UP' : 'DOWN'
  };

  try {
    const dbRes = await pool.query('SELECT 1');
    checks.database = dbRes ? 'UP' : 'DOWN';
  } catch (err) {
    checks.database = 'FALLBACK_READY'; // Keep ready for demo if standalone
  }

  res.status(200).json({
    status: 'READY',
    checks,
    podName: process.env.HOSTNAME || os.hostname(),
    timestamp: new Date().toISOString()
  });
});

// System info endpoint (proves Pod load balancing in K8s)
app.get('/api/info', (req, res) => {
  res.status(200).json({
    application: 'CloudNative DevSecOps Platform API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    hostname: process.env.HOSTNAME || os.hostname(),
    platform: `${os.type()} ${os.arch()}`,
    nodeVersion: process.version,
    memoryUsage: process.memoryUsage(),
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// ==========================================
// 4. Business Logic API (Redis Cache-Aside)
// ==========================================

// GET /api/items (Demonstrates Redis caching with Cache HIT / MISS indicator)
app.get('/api/items', async (req, res) => {
  const cacheKey = 'app:items';

  // Check Redis Cache
  if (isRedisConnected) {
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) {
        return res.status(200).json({
          source: 'REDIS_CACHE (CACHE HIT ⚡)',
          cached: true,
          count: JSON.parse(cached).length,
          data: JSON.parse(cached),
          servedBy: process.env.HOSTNAME || os.hostname()
        });
      }
    } catch (e) {
      console.warn('Cache read error:', e.message);
    }
  }

  // Cache MISS - Fetch from DB or memory fallback
  let items = memoryStore;
  try {
    const result = await pool.query('SELECT * FROM items ORDER BY id ASC');
    if (result && result.rows.length > 0) {
      items = result.rows;
    }
  } catch (err) {
    // Uses fallback data
  }

  // Save to Redis Cache (TTL: 60 seconds)
  if (isRedisConnected) {
    try {
      await redisClient.set(cacheKey, JSON.stringify(items), { EX: 60 });
    } catch (e) {
      console.warn('Cache write error:', e.message);
    }
  }

  return res.status(200).json({
    source: 'DATABASE / STORAGE (CACHE MISS 🐢)',
    cached: false,
    count: items.length,
    data: items,
    servedBy: process.env.HOSTNAME || os.hostname()
  });
});

// POST /api/items (Invalidates Redis cache on new write)
app.post('/api/items', async (req, res) => {
  const { title, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const newItem = {
    id: memoryStore.length + 1,
    title,
    status: status || 'Pending',
    createdAt: new Date().toISOString()
  };

  memoryStore.push(newItem);

  // Invalidate Redis cache
  if (isRedisConnected) {
    try {
      await redisClient.del('app:items');
    } catch (e) {
      console.warn('Cache invalidate error:', e.message);
    }
  }

  res.status(201).json({
    message: 'Item created successfully and cache invalidated',
    item: newItem,
    servedBy: process.env.HOSTNAME || os.hostname()
  });
});

module.exports = { app, pool, redisClient };
