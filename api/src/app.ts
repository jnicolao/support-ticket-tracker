import cors from 'cors';
import express from 'express';
import { errorHandler, notFound } from './errors';
import { ticketsRouter } from './tickets/routes';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/tickets', ticketsRouter);

app.use(notFound);
app.use(errorHandler);
