import Redis from "ioredis"
import { configDotenv } from "dotenv";

configDotenv()
export const redis = new Redis(process.env.REDISURL);
// redis.set('fxoo', 'baar');