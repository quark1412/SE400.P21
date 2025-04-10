import env from "./config/env.js";
import express from "express";
import cors from "cors";
import Redis from "ioredis";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import logger from "./utils/logger.js";
import proxy from "express-http-proxy";
import authMiddleware from "./middlewares/authMiddleware.js";

const app = express();
const PORT = env.PORT || 8080;

const redisClient = new Redis(env.REDIS_URL);

app.use(helmet());
app.use(cors());
app.use(express.json());

const ratelimitOptions = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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

app.use(ratelimitOptions);

app.use((req, res, next) => {
  logger.info(`Received ${req.method} request to ${req.url}`);
  logger.info(`Request body, ${req.body}`);
  next();
});

app.use("/api/v1/auth", proxy(env.USER_SERVICE_URL));
app.use(
  "/api/v1/product",
  authMiddleware,
  proxy(env.PRODUCT_SERVICE_URL, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user)
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
  })
);
app.use(
  "/api/v1/order",
  authMiddleware,
  proxy(env.ORDER_SERVICE_URL, {
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user)
        proxyReqOpts.headers["x-user-id"] = srcReq.user.userId;

      return proxyReqOpts;
    },
  })
);

app.listen(PORT, () => {
  logger.info(`API Gateway is running on port ${PORT}`);
  logger.info(`User service is running on port ${env.USER_SERVICE_URL}`);
  logger.info(`Product service is running on port ${env.PRODUCT_SERVICE_URL}`);
  logger.info(`Order service is running on port ${env.ORDER_SERVICE_URL}`);
});
