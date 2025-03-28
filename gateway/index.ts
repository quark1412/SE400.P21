import express from "express";
import proxy from "express-http-proxy";
import rateLimit from "express-rate-limit";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Fixed Window Algorithm
const fixedWindowRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  handler: (req, res) => {
    res.status(429).json({
      status: 429,
      message: "Too many requests!",
    });
  },
});

// Sliding Window Algorithm
const slidingWindowRateLimiter = (maxRequests: number, windowMs: number) => {
  const requestLog: Record<string, number[]> = {};
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    const currentTime = Date.now();
    const windowStart = currentTime - windowMs;
    const ip = req.ip || "unknown";

    if (!requestLog[ip]) {
      requestLog[ip] = [];
    }

    requestLog[ip] = requestLog[ip].filter(
      (timestamp: number) => timestamp > windowStart
    );

    if (requestLog[ip].length >= maxRequests) {
      res.status(429).json({
        status: 429,
        message: "Too many request!",
      });
    }

    requestLog[ip].push(currentTime);
    next();
  };
};

const tokenBucketRateLimiter = (
  maxTokens: number,
  refillRate: number,
  refillInterval: number
) => {
  const buckets: Record<string, { tokens: number; lastRefill: number }> = {};
  return (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    const ip = req.ip || "unknown";
    const currentTime = Date.now();

    if (!buckets[ip]) {
      buckets[ip] = { tokens: maxTokens, lastRefill: currentTime };
    }

    const bucket = buckets[ip];
    const timeSinceLastRefill = currentTime - bucket.lastRefill;

    const tokensToAdd =
      Math.floor(timeSinceLastRefill / refillInterval) * refillRate;
    bucket.tokens = Math.min(maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = currentTime;

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      next();
    } else {
      res.status(429).json({
        status: 429,
        message: "Too many request!",
      });
    }
  };
};

app.use(fixedWindowRateLimiter);
// app.use(slidingWindowRateLimiter(5, 6 * 1000));
// app.use(tokenBucketRateLimiter(10, 1, 1000))

const auth = proxy("http://user:8081");
const products = proxy("http://product:8082");
const orders = proxy("http://order:8083");

app.use("/api/v1/auth", auth);
app.use("/api/v1/products", products);
app.use("/api/v1/orders", orders);

const server = app.listen(8080, () => {
  console.log("Gateway is listening to port 8080");
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      console.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error: unknown) => {
  console.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);
