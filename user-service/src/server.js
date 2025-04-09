import env from "./config/env.js";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";
import {rateLimit} from "express-rate-limit";
import {RedisStore} from "rate-limit-redis";
import logger from "./utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import mongoose from "mongoose";
import userRoute from "./routes/userRoute.js";
import passport from "passport";

const app = express();
const PORT = env.PORT || 8081;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(passport.initialize());

await mongoose
  .connect(env.MONGODB_URL)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(env.REDIS_URL);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

const rateLimiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "middleware",
  points: 10,
  duration: 1,
});

app.use((req, res, next) => {
  rateLimiter
    .consume(req.ip)
    .then(() => next())
    .catch(() => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ success: false, message: "Too many requests" });
    });
});

const sensitiveEndpointsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Sensitive endpoint rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ success: false, message: "Too many requests" });
  },
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

app.use("/signup", sensitiveEndpointsLimiter);
app.use("/", userRoute);

app.listen(PORT, () => {
  logger.info(`User service running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});