#! /usr/bin/env node
const app = require('../server')

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening to port http://localhost:${port}`);
});

