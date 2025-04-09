import env from "./config/env.js";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";
import logger from "./utils/logger.js";
import { RateLimiterRedis } from "rate-limiter-flexible";
import mongoose from "mongoose";
import productRoute from "./routes/productRoute.js";

const app = express();
const PORT = env.PORT || 8082;

app.use(helmet());
app.use(cors());
app.use(express.json());

await mongoose
  .connect(env.MONGODB_URL)
  .then(() => logger.info("Connected to mongodb"))
  .catch((e) => logger.error("Mongo connection error", e));

const redisClient = new Redis(env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

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

app.use("/", productRoute);

app.listen(PORT, () => {
  logger.info(`Product service running on port ${PORT}`);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("Unhandled Rejection at", promise, "reason:", reason);
});