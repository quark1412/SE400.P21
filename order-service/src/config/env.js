import { config } from "dotenv";

const configFile = `./.env`;
config({ path: configFile });

const {
  MONGODB_URL,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  NODE_ENV,
  REDIS_URL,
  API_GATEWAY_URL
} = process.env;

export default {
  MONGODB_URL,
  PORT,
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  NODE_ENV,
  REDIS_URL,
  API_GATEWAY_URL
};
