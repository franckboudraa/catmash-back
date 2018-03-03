const express = require('express');
const app = express();
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

app.get('/', (req, res) => {
  redis.set('foo', 'bar');
  redis.get('foo', function(err, result) {
    res.send(result);
  });
});

app.listen(process.env.PORT);
