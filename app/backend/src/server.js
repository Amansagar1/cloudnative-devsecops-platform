const { app, pool, redisClient } = require('./app');

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Microservice API running on port ${PORT}`);
  console.log(`📊 Metrics: http://localhost:${PORT}/metrics`);
  console.log(`💓 Liveness: http://localhost:${PORT}/api/live`);
  console.log(`🩺 Readiness: http://localhost:${PORT}/api/ready`);
  console.log(`📦 Host: ${process.env.HOSTNAME || require('os').hostname()}`);
  console.log(`===============================================`);
});

// ==========================================
// Graceful Shutdown for Kubernetes (SIGTERM)
// ==========================================
// When Kubernetes terminates a pod, it sends SIGTERM.
// We must close active connections gracefully before exit.
const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🔒 Closed out remaining HTTP connections.');
    try {
      await pool.end();
      console.log('💾 PostgreSQL connection pool drained.');
      if (redisClient.isOpen) {
        await redisClient.quit();
        console.log('⚡ Redis connection closed.');
      }
    } catch (err) {
      console.error('Error during teardown:', err);
    }
    console.log('👋 Process terminated cleanly.');
    process.exit(0);
  });

  // Force shutdown after 10 seconds if hanging
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
