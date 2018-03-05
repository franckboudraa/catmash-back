const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 6379); // connection to redis db

module.exports = {
  pullCatScore: async id => {
    try {
      data = await redis.get(`cat_${id}`);
    } catch (error) {
      return error;
    }
    if (!data) {
      module.exports.pushCatScore(id, 1200); // if this cat doesn't exist yet in db, create one with a score of 1200
      return 1200;
    }
    return await Number(data);
  },
  pushCatScore: async (id, score) => {
    try {
      redis.set(`cat_${id}`, score);
    } catch (error) {
      return error;
    }
  }
};
