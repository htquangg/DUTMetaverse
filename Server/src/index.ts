import express from 'express';
import { Server, LobbyRoom } from 'colyseus';
import cors from 'cors';
import 'dotenv/config';
import parser from 'body-parser';
import { createServer } from 'http';
import { monitor } from '@colyseus/monitor';

import { DUTOffice } from './rooms/DUTOffice';
import { RoomState } from './types/';

const port = Number(process.env.PORT) || 3000;

console.log('@@@@@@@@@@@@ env: ', process.env.NODE_ENV);
const app = express();
app.use(cors());
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
//
// app.use(express.json());

const gameServer = new Server({
  server: createServer(app),
});

// register your room handlers
gameServer.define(RoomState.LOBBY, LobbyRoom);
gameServer.define(RoomState.PUBLIC, DUTOffice);

app.use('/colyseus', monitor());
app.post('/fb_data_deletion', (req, res, next) => {
    console.log(req.body); // {}
    console.log(req.query); // {}

    if (!req.body || !req.body.signed_request) {
        console.log('Bad request'); // Ends up here whenever Facebook calls this route
        // return req.sendStatus(400);
    }

    // verify request, delete user's data + other code here

});
gameServer.listen(port);
