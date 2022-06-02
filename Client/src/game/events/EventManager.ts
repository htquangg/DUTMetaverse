import Phaser from 'phaser';
import { EventParamsMap, EventName } from '@tlq/game/types';

export default class EventManager extends Phaser.Events.EventEmitter {
  public static inst: EventManager;

  public static getInstance(): EventManager {
    if (!EventManager.inst) {
      EventManager.inst = new EventManager();
    }
    return EventManager.inst;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  emit<E extends EventName, P extends EventParamsMap[E]>(
    event: E | symbol,
    args: P,
  ): boolean {
    return super.emit(event, args);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  on<E extends EventName, P extends EventParamsMap[E]>(
    event: E | symbol,
    fn: (message: P) => void,
    context?: any,
  ): this;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  on<E extends EventName, P extends EventParamsMap[E]>(
    event: E | symbol,
    fn: (message: P) => any,
    context?: any,
  ): this;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  on(
    event: string | symbol,
    fn: (...args: unknown[]) => unknown,
    context?: any,
  ): this {
    return super.on(event, fn, context);
  }
}
