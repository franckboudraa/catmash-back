const express = require('express');
const Redis = require('ioredis');
const Elo = require('elo-js');

const app = express();
app.use(express.json()); // handling post params
const redis = new Redis(process.env.REDIS_URL || 6379); // connection to redis db

const pullCatScore = async id => {
  try {
    data = await redis.get(`cat_${id}`);
  } catch (error) {
    return error;
  }
  if (!data) {
    pushCatScore(id, 1200); // if this cat doesn't exist yet in db, create one with a score of 1200
    return 1200;
  }
  return await Number(data);
};

const pushCatScore = async (id, score) => {
  try {
    redis.set(`cat_${id}`, score);
  } catch (error) {
    return error;
  }
};

app.post('/new', async (req, res, next) => {
  const { winner_id, looser_id } = req.body;
  let winnerBeforeScore, looserBeforeScore, winnerAfterScore, looserAfterScore;
  const elo = new Elo();

  try {
    winnerBeforeScore = await pullCatScore(winner_id); // pull the initial winner score from redis store
    looserBeforeScore = await pullCatScore(looser_id); // pull the initial looser score from redis store
  } catch (error) {
    next(error);
  }

  winnerAfterScore = await elo.ifWins(winnerBeforeScore, looserBeforeScore);
  looserAfterScore = await elo.ifLoses(looserBeforeScore, winnerBeforeScore);

  try {
    pushCatScore(winner_id, winnerAfterScore); // push the new winner score to redis store
    pushCatScore(looser_id, looserAfterScore); // push the new looser score to redis store
  } catch (error) {
    next(error);
  }

  res.json({
    cats: [
      {
        id: winner_id,
        winnerBeforeScore,
        winnerAfterScore
      },
      {
        id: looser_id,
        looserBeforeScore,
        looserAfterScore
      }
    ]
  });
});

app.use(function(err, req, res, next) {
  res.status(500).send('Something broke!');
});

app.use(function(req, res, next) {
  res.status(404).send('Meooow! Cat not found!');
});

app.listen(process.env.PORT || 3000);
