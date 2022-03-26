"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DUTOffice = void 0;
const colyseus_1 = require("colyseus");
const command_1 = require("@colyseus/command");
const DUTState_1 = require("./schema/DUTState");
const commands_1 = require("./commands");
const Messages_1 = require("../types/Messages");
class DUTOffice extends colyseus_1.Room {
    onCreate(options) {
        this._dispatcher = new command_1.Dispatcher(this);
        this.setState(new DUTState_1.DUTState());
        this.onMessage(Messages_1.Messages.UPDATE_PLAYER, (client, message) => {
            this._dispatcher.dispatch(new commands_1.PlayerUpdateCommand(), {
                client: client,
                x: message.x,
                y: message.y,
                anim: message.anim,
            });
        });
    }
    onJoin(client, options) {
        this.state.players.set(client.sessionId, new DUTState_1.Player());
        client.send(Messages_1.Messages.READY_TO_CONNECT, {
            id: this.roomId,
            message: 'hello new player'
        });
    }
    onLeave(client, consented) {
        if (this.state.players.has(client.sessionId)) {
            this.state.players.delete(client.sessionId);
        }
    }
    onDispose() { }
}
exports.DUTOffice = DUTOffice;
