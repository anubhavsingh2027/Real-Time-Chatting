import client from "prom-client";

// Default metrics
client.collectDefaultMetrics();

// Custom metrics
export const messageCounter = new client.Counter({
  name: "messages_total",
  help: "Total number of messages sent",
  labelNames: ["status"],
});

export const activeDatabaseConnections = new client.Gauge({
  name: "active_db_connections",
  help: "Number of active database connections",
});

export const onlineUsersGauge = new client.Gauge({
  name: "online_users",
  help: "Number of currently online users",
});

export const messageDeliveryHistogram = new client.Histogram({
  name: "message_delivery_duration_seconds",
  help: "Time taken to deliver a message in seconds",
  buckets: [0.1, 0.5, 1, 2, 5, 10],
});

export const messageQueueSize = new client.Gauge({
  name: "message_queue_size",
  help: "Size of message processing queue",
  labelNames: ["queue_type"],
});

export const socketConnections = new client.Gauge({
  name: "socket_connections",
  help: "Number of active socket connections",
});

export const httpRequestDuration = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.1, 0.5, 1, 2, 5],
});

export const cacheHitRate = new client.Counter({
  name: "cache_hits_total",
  help: "Total cache hits",
  labelNames: ["cache_type"],
});

export const cacheMissRate = new client.Counter({
  name: "cache_misses_total",
  help: "Total cache misses",
  labelNames: ["cache_type"],
});

export const errorCounter = new client.Counter({
  name: "errors_total",
  help: "Total number of errors",
  labelNames: ["error_type"],
});

export async function getMetrics() {
  return await client.register.metrics();
}

export function setupMetricsMiddleware(app) {
  // Metrics endpoint
  app.get("/metrics", async (req, res) => {
    try {
      res.set("Content-Type", client.register.contentType);
      res.end(await getMetrics());
    } catch (error) {
      console.error("Metrics endpoint error:", error);
      res.status(500).end(error.message);
    }
  });

  // Request timing middleware
  app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
      const duration = (Date.now() - start) / 1000;
      httpRequestDuration
        .labels(req.method, req.route?.path || req.path, res.statusCode)
        .observe(duration);
    });
    next();
  });
}
