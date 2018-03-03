const express = require('express');
const Redis = require('ioredis');
const Elo = require('elo-js');

const app = express();
app.use(express.json()); // handling post params
const redis = new Redis(process.env.REDIS_URL || 6379); // connection to redis db

const fetchCatScore = async id => {
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
  /*
  req.body.winner_id
  req.body.looser_id
  */
  const elo = new Elo();
  console.log('winner:', req.body.winner_id);
  console.log('looser:', req.body.looser_id);

  score_before_battle_for_winner = await fetchCatScore(req.body.winner_id);
  score_before_battle_for_looser = await fetchCatScore(req.body.looser_id);

  score_before_battle_for_winner = Number(score_before_battle_for_winner);
  score_before_battle_for_looser = Number(score_before_battle_for_looser);

  console.log(score_before_battle_for_winner);
  console.log(score_before_battle_for_looser);

  const score_after_battle_for_winner = elo.ifWins(
    score_before_battle_for_winner,
    score_before_battle_for_looser
  );
  const score_after_battle_for_looser = elo.ifLoses(
    score_before_battle_for_looser,
    score_after_battle_for_winner
  );

  console.log(score_after_battle_for_winner);
  console.log(score_after_battle_for_looser);

  res.json({
    cats: [
      {
        id: req.body.winner_id,
        scoreBefore: score_before_battle_for_winner,
        scoreAfter: score_after_battle_for_winner
      },
      {
        id: req.body.looser_id,
        scoreBefore: score_before_battle_for_looser,
        scoreAfter: score_after_battle_for_looser
      }
    ]
  });
});

app.use(function(req, res, next) {
  res.status(404).send('Meeooowww!');
});

app.listen(process.env.PORT || 3000);
