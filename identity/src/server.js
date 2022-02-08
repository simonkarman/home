const express = require('express')
const fs = require('fs');
const app = express()
const port = process.env.PORT

const privateKey = fs.readFileSync(`/etc/letsencrypt/live/${process.env.DOMAIN_NAME}/privkey.pem`, { encoding: 'utf-8' });

app.get('*', (req, res) => {
  res.send(`You reached the api of the Identity Service at '${req.path}'!`);
  console.log('GET on ' + req.path);
})

app.listen(port, () => {
  console.log(`Identity Service is listening on port ${port}`);
  console.log('jwt-sercet:', privateKey.substring(20, 40));
})