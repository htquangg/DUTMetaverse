import express from 'express';
import { Server, LobbyRoom } from 'colyseus';
import cors from 'cors';
import 'dotenv/config';
import parser from 'body-parser';
import { createServer } from 'http';
import { monitor } from '@colyseus/monitor';

import { DUTOffice } from './rooms/DUTOffice';
import { RoomState } from './types/';
import Utils from './utils';

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
app.post('/auth/facebook/callback', (req, res) => {
  if (!req.body || !req.body.signed_request) {
    console.log('@@@ auth facebook callback failed'); // Ends up here whenever Facebook calls this route
    return res.sendStatus(404);
  }

  // verify request, delete user's data + other code here
  const data = Utils.parseSignedRequest(req.body.signed_request);
  const userId = data['user_id'];
  // Remove all data for user here
  // delete user id from DB
  console.log('@@@ delete user id from DB!!!');

  const confirmationCode = Utils.randomNumber();
  const path = `/facebook/deletion-status?code=${confirmationCode}`;
  const url = Utils.toAbsoluteUrl(req, path);

  const payload = {
    url: `${url}`,
    confirmation_code: `${confirmationCode}`,
  };
  console.log('@@@ data auth facebook callback: ', data);
  console.log('@@@ payload auth facebook callback: ', payload);
  // Facebook requires the JSON to be non-quoted and formatted like this, so we need to create the JSON by hand:
  res.type('json');
  res.send(payload);
});

app.get('/facebook/deletion-status', (req, res) => {
  const code = req.query.code;
  console.log('@@@ facebook deletion-status: ', code);
  res.send({ code });
  // res.render('facebook/deletionStatus', { code });
});

gameServer.listen(port);
