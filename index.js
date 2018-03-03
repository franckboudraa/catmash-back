const express = require('express');
const app = express();

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

/*app.get('/', (req, res) => {
  redis.set('foo', 'bar');
  redis.get('foo', function(err, result) {
    res.send(result);
  });
});*/

app.use(express.json());

app.post('/new', async (req, res) => {
  try {
    const data = await redis.get('foobar');
    res.send(data);
    console.log(data);
  } catch (error) {
    res.send(error);
    console.log(error);
  }
});

app.listen(process.env.PORT || 3000);
