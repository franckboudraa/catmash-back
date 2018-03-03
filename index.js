const express = require('express');
const app = express();
app.use(express.json());

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL || 6379);

const fetchCat = async id => {
  try {
    data = await redis.get(`cat_${id}`);
  } catch (error) {
    res.send(503); // if Redis return an error
  }
  if (!data) {
    // if this cat doesn't exist yet in db, create one with a score of 1200
    redis.set(`cat_${id}`, '1200');
    return 1200;
  }
  return await data;
};

app.post('/new', async (req, res) => {
  score_cat_1 = await fetchCat(req.body.cat1);
  score_cat_2 = await fetchCat(req.body.cat2);

  res.json({
    cats: [
      { id: req.body.cat1, score: score_cat_1 },
      { id: req.body.cat1, score: score_cat_1 }
    ]
  });
});

app.listen(process.env.PORT || 3000);
