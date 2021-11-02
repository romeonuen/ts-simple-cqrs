import {Observable, Subscription} from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommandBus } from './command-bus';
import {EVENTS_HANDLER_METADATA, SAGA_METADATA} from './decorators/constants';
import { InvalidSagaException } from './exceptions';
import { DefaultPubSub } from './helpers/default-pubsub';
import {
  IEvent,
  IEventBus,
  IEventHandler,
  IEventPublisher,
  ISaga, Type,
} from './interfaces';
import { ObservableBus } from './utils';
import { CQRSContainer } from "./container";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {defaultGetEventName} from "./helpers/default-get-event-name";

export type EventHandlerType<EventBase extends IEvent = IEvent> = Type<IEventHandler<EventBase>>;

@injectable()
export class EventBus<EventBase extends IEvent = IEvent> extends ObservableBus<EventBase> implements IEventBus<EventBase> {
  protected getEventName: (event: EventBase) => string;
  protected readonly subscriptions: Subscription[];
  private _publisher: IEventPublisher<EventBase>;

  constructor(@inject(TYPES.CommandBus) private _commandBus: CommandBus) {
    super();
    this.subscriptions = [];
    this.getEventName = defaultGetEventName;
    this.useDefaultPublisher();
  }
  get publisher(): IEventPublisher<EventBase> {
    return this._publisher;
  }

  set publisher(_publisher: IEventPublisher<EventBase>) {
    this._publisher = _publisher;
  }

  publish<T extends EventBase>(event: T) {
    return this._publisher.publish(event);
  }

  publishAll<T extends EventBase>(events: T[]) {
    if (this._publisher.publishAll) {
      return this._publisher.publishAll(events);
    }
    return (events || []).map((event) => this._publisher.publish(event));
  }

  bind(handler: IEventHandler<EventBase>, name: string) {
    const stream$ = name ? this.ofEventName(name) : this.subject$;
    const subscription = stream$.subscribe((event) => handler.handle(event));
    this.subscriptions.push(subscription);
  }

  register(handlers: EventHandlerType<EventBase>[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  protected registerHandler(handlerType: EventHandlerType) {
    CQRSContainer.bind(handlerType).toSelf()
    const handler = CQRSContainer.get(handlerType) as IEventHandler

    const eventsNames = this.reflectEventsNames(handlerType);
    eventsNames.map((event) => {
      this.bind(handler as IEventHandler<EventBase>, event.name);
    });
  }

  registerSagas(types: Type<unknown>[] = []) {
    const sagas = types
      .map((target) => {
        const metadata = Reflect.getMetadata(SAGA_METADATA, target) || [];
        CQRSContainer.bind(target).toSelf()
        const instance = CQRSContainer.get(target) as ISaga;
        if (!instance) {
          throw new InvalidSagaException();
        }
        return metadata.map((key: string) => instance[key].bind(instance));
      })
      .reduce((a, b) => a.concat(b), []);

    sagas.forEach((saga) => this.registerSaga(saga));
  }

  protected ofEventName(name: string) {
    return this.subject$.pipe(filter((event) => {
      return this.getEventName(event) === name
      }),
    );
  }

  protected registerSaga(saga: ISaga<EventBase>) {
    if (typeof saga !== 'function') {
      throw new InvalidSagaException();
    }
    const stream$ = saga(this);
    if (!(stream$ instanceof Observable)) {
      throw new InvalidSagaException();
    }

    const subscription = stream$
      .pipe(filter((e) => !!e))
      .subscribe((command) => this._commandBus.execute(command));

    this.subscriptions.push(subscription);
  }

  private reflectEventsNames(
    handler,
  ): FunctionConstructor[] {
    return Reflect.getMetadata(EVENTS_HANDLER_METADATA, handler);
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultPubSub<EventBase>(this.subject$);
  }
}
