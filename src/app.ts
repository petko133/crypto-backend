import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';

import { router } from './routes/auth.js';
const app = express();

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use('/', router);

const DB_URL: string | undefined = process.env.MONGODB_URL;

mongoose
  .connect(DB_URL!)
  .then(() => {
    app.listen(8000);
  })
  .catch((err) => {
    console.log(err);
  });
