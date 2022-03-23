import express from 'express';
import { Server } from 'colyseus';
import cors from 'cors';
import { createServer } from 'http';
import { monitor } from '@colyseus/monitor';

import { DUTOffice } from './rooms/DUTOffice';

const port = Number(process.env.port) || 3000;

const app = express();
app.use(express.json());
app.use(cors());

const gameServer = new Server({
  server: createServer(app),
});

// register your room handlers
gameServer.define('my_room', DUTOffice);

app.use('/colyseus', monitor());
gameServer.listen(port);
