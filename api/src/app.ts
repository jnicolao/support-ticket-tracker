import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './errors';

export const app = express();

app.use(cors());
app.use(express.json());

app.use(notFound);
app.use(errorHandler);
