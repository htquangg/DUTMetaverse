import { Command } from '@colyseus/command';
import { Client } from 'colyseus';
import { DUTOffice } from '../DUTOffice';
import { ChatMessage } from '../schema/DUTState';

type Payload = {
  client: Client;
  content: string;
};

export class ChatMessageUpdateCommand extends Command<DUTOffice, Payload> {
  execute(payload: Payload) {
    const { client, content } = payload;
    const player = this.state.players.get(client.sessionId);

    const chatMessages = this.state.chatMessages;
    if (!chatMessages || !player) return;

    if (chatMessages.length >= 100) chatMessages.shift();

    const newMessage = new ChatMessage();
    newMessage.author = player.name;
    newMessage.content = content;
    chatMessages.push(newMessage);
  }
}
