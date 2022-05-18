import express from 'express';
import fs from 'fs';
import { Server, LobbyRoom } from 'colyseus';
import 'dotenv/config';
import https from 'https';
import http from 'http';
import { DUTOffice } from './rooms/DUTOffice';
import { RoomState } from './types/';
import './utils/handleCrash';
import middleware from './middleware';
import servicesRoutes from './services';
import { ServiceConfig } from './config/ServiceConfig';
import { applyRouteSet, applyMiddleware } from './helper';

const port = ServiceConfig.port;

const app = express();

applyMiddleware(middleware, app);
applyRouteSet(servicesRoutes, app);

let gameServer: Server;
if (ServiceConfig.isDev && ServiceConfig.enableSSL) {
  const serverOptions = {
    key: fs.readFileSync(__dirname + '/config/localhost_key.pem'),
    cert: fs.readFileSync(__dirname + '/config/localhost_cert.pem'),
  };
  gameServer = new Server({
    server: https.createServer(serverOptions, app),
  });
} else {
  gameServer = new Server({
    server: http.createServer(app),
  });
}

// register your room handlers
gameServer.define(RoomState.LOBBY, LobbyRoom);
gameServer.define(RoomState.PUBLIC, DUTOffice);

console.log('[Server Config]: ', ServiceConfig);
gameServer.listen(port);
