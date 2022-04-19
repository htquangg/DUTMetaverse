import Phaser from 'phaser';
import { EventParamsMap, EventName, KeyEventMessage } from '@tlq/game/types';

export default class EventManager extends Phaser.Events.EventEmitter {
  public static inst: EventManager;

  public static getInstance(): EventManager {
    if (!EventManager.inst) {
      EventManager.inst = new EventManager();
    }
    return EventManager.inst;
  }

  emit<E extends EventName, P extends EventParamsMap[E]
  >(
    event: E | symbol,
    args: P,
  ): boolean {
    return super.emit(event, args);
  }

  on<E extends EventName, P extends EventParamsMap[E]>(
    event: E | symbol,
    fn: (message: P) => void,
    context?: any,
  ): this;

  on<E extends EventName, P extends EventParamsMap[E]>(
    event: E | symbol,
    fn: (message: P) => any,
    context?: any,
  ): this;

  on(event: string | symbol, fn: Function, context?: any): this {
    return super.on(event, fn, context);
  }
}
