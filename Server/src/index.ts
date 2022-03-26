import express from 'express';
import { Server, LobbyRoom } from 'colyseus';
import cors from 'cors';
import 'dotenv/config'
import { createServer } from 'http';
import { monitor } from '@colyseus/monitor';

import { DUTOffice } from './rooms/DUTOffice';
import { RoomState } from './types/';

const port = Number(process.env.port) || 3000;

console.log("@@@@@@@@@@@@ env: ", process.env.NODE_ENV)
const app = express();
app.use(express.json());
app.use(cors());

const gameServer = new Server({
  server: createServer(app),
});

// register your room handlers
gameServer.define(RoomState.LOBBY, LobbyRoom);
gameServer.define(RoomState.PUBLIC, DUTOffice);

app.use('/colyseus', monitor());
gameServer.listen(port);
