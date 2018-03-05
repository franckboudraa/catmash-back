const express = require('express');
const helmet = require('helmet');

const Elo = require('elo-js');
const Scores = require('./scores');
const cats = ({ images } = require('./public/cats.json'));

const app = express();
app.use(helmet());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
app.use(express.json()); // handling post params

app.get('/scores', async (req, res, next) => {
  let i = 1;
  const catsWithScores = await Promise.all(
    cats.images.map(async cat => {
      cat.score = await Scores.pullCatScore(cat.id);
      return cat;
    })
  );
  catsWithScores.sort(function(a, b) {
    return b.score - a.score;
  });
  const catsSorted = catsWithScores.map(cat => {
    cat.pos = i;
    i++;
    return cat;
  });
  res.send(catsSorted);
});

app.post('/new', async (req, res, next) => {
  const { winnerId, looserId } = req.body;
  let winnerBeforeScore, looserBeforeScore, winnerAfterScore, looserAfterScore;
  const elo = new Elo();

  // pull initial score from redis
  winnerBeforeScore = await Scores.pullCatScore(winnerId);
  looserBeforeScore = await Scores.pullCatScore(looserId);

  // compute new score with elo system
  winnerAfterScore = await elo.ifWins(winnerBeforeScore, looserBeforeScore);
  looserAfterScore = await elo.ifLoses(looserBeforeScore, winnerBeforeScore);

  // push new score to redis
  Scores.pushCatScore(winnerId, winnerAfterScore);
  Scores.pushCatScore(looserId, looserAfterScore);

  res.send('ok');
});

app.use(express.static('public')); // static files (used for cats.json)

app.use(function(err, req, res, next) {
  res.status(500).send('Something broke!');
});

app.listen(process.env.PORT || 3000);
