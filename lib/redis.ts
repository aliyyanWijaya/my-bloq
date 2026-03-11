import IORedis, { Redis } from "ioredis";

class ClientRedis {
  static instance: Redis;

  private constructor() {} // Private constructor untuk Singleton

  static getInstance(): Redis {
    if (!ClientRedis.instance) {
      const redisUrl = process.env.REDIS_URL;
      
      // Jika variabel lingkungan tidak terbaca, kita kasih peringatan keras
      if (!redisUrl) {
        console.error("❌ ERROR: REDIS_URL tidak ditemukan di .env.local");
        throw new Error("REDIS_URL is missing");
      }

      ClientRedis.instance = new IORedis(redisUrl);
      
      ClientRedis.instance.on("error", (err) => {
        console.error("❌ IORedis Error:", err.message);
      });
    }
    return ClientRedis.instance;
  }
}

const redisInstance = ClientRedis.getInstance();
export default redisInstance;