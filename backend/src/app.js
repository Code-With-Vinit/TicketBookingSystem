// src/app.js
const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const showsRouter = require('./routes/shows');
const bookingsRouter = require('./routes/bookings');

const app = express();
app.use(bodyParser.json());

app.use('/api/shows', showsRouter);
app.use('/api/bookings', bookingsRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
