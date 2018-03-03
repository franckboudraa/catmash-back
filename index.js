const express = require('express');
const app = express();
var client = require('redis').createClient(process.env.REDIS_URL);

app.get('/', (req, res) => {
  client.set('string_key', 'string val', redis.print);
  client.get('string_key', function(err, reply) {
    // reply is null when the key is missing
    console.log(reply);
    res.json(reply);
  });
});

app.listen(3000);
