"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const colyseus_1 = require("colyseus");
const cors_1 = __importDefault(require("cors"));
require("dotenv/config");
const http_1 = require("http");
const monitor_1 = require("@colyseus/monitor");
const DUTOffice_1 = require("./rooms/DUTOffice");
const types_1 = require("./types/");
const port = Number(process.env.port) || 3000;
console.log("@@@@@@@@@@@@ env: ", process.env.NODE_ENV);
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const gameServer = new colyseus_1.Server({
    server: (0, http_1.createServer)(app),
});
// register your room handlers
gameServer.define(types_1.RoomState.LOBBY, colyseus_1.LobbyRoom);
gameServer.define(types_1.RoomState.PUBLIC, DUTOffice_1.DUTOffice);
app.use('/colyseus', (0, monitor_1.monitor)());
gameServer.listen(port);
