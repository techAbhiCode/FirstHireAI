import Redis from "ioredis";

let redisUrl = (process.env.REDIS_URL || "redis://127.0.0.1:6379").trim();

// Strip quotes if user pasted with quotes
redisUrl = redisUrl.replace(/^["']|["']$/g, "").trim();

// Automatically extract the clean URL if user accidentally copied the redis-cli command
if (redisUrl.includes(" -u ")) {
  redisUrl = redisUrl.split(" -u ")[1].trim();
} else if (redisUrl.includes("redis-cli")) {
  const match = redisUrl.match(/(rediss?:\/\/[^\s'"]+)/);
  if (match) {
    redisUrl = match[1];
  }
}

// Ensure TLS for Upstash or cloud redis endpoints that require encryption
if (redisUrl.includes("upstash.io") && redisUrl.startsWith("redis://")) {
  redisUrl = redisUrl.replace(/^redis:\/\//, "rediss://");
}

const redis = new Redis(redisUrl);

export default redis;