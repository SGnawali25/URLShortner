// utils/redis.js
import { createClient } from 'redis';

let client;

export const getRedisClient = async () => {
  if (!client) {

    client = createClient({
      username: 'default',
      password: process.env.REDIS_PASS,
      socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
      }
    });

    client.on('error', (err) => console.error('Redis Client Error:', err));

    await client.connect();
  }

  return client;
};
