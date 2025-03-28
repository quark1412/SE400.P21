import { config } from "dotenv";

const configFile = `./.env`;
config({ path: configFile });

const {
  PORT,
  NODE_ENV,
  REDIS_URL,
  USER_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  ORDER_SERVICE_URL
} = process.env;

export default {
  PORT,
  NODE_ENV,
  REDIS_URL,
  USER_SERVICE_URL,
  PRODUCT_SERVICE_URL,
  ORDER_SERVICE_URL
};
