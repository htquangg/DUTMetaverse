import Phaser from 'phaser';
import { EventType, EventParamsMap } from '@tlq/types';

export default class EventManager extends Phaser.Events.EventEmitter {
  public static inst: EventManager;

  public static getInstance(): EventManager {
    if (!EventManager.inst) {
      EventManager.inst = new EventManager();
    }
    return EventManager.inst;
  }

  emit<E extends EventType, P extends EventParamsMap[E]>(
    event: E | symbol,
    args: P,
  ): boolean {
    return super.emit(event, args);
  }

  on<E extends EventType, P extends EventParamsMap[E]>(
    event: E | symbol,
    fn: (message: P) => void,
    context?: any,
  ): this;

  on<E extends EventType, P extends EventParamsMap[E]>(
    event: E | symbol,
    fn: (message: P) => any,
    context?: any,
  ): this;

  on(event: string | symbol, fn: Function, context?: any): this {
    return super.on(event, fn, context);
  }
}
