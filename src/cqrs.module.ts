import {CommandBus, CommandHandlerType} from "./command-bus";
import {inject, injectable} from "inversify";
import {TYPES} from "./types";
import {EventBus, EventHandlerType} from "./event-bus";
import {Type} from "./interfaces";
import {QueryBus} from "./query-bus";
import {SimpleCQRSType} from "./index";

export type ServiceType = Required<{
  commands: CommandHandlerType[],
  events: EventHandlerType[],
  sagas: Type[],
  queries: Type[]
}>

export interface ICQRSModule {
  explore(handler: ServiceType): SimpleCQRSType;
}

@injectable()
export class CQRSModule implements ICQRSModule {
  constructor(
    @inject(TYPES.CommandBus) private readonly _commandBus: CommandBus,
    @inject(TYPES.EventBus) private readonly _eventBus: EventBus,
    @inject(TYPES.QueryBus) private readonly _queryBus: QueryBus
  ) {
  }

  explore(type: ServiceType): SimpleCQRSType {
    const { commands, events, sagas, queries } = type;

    this._commandBus.register(commands);
    this._eventBus.register(events);
    this._eventBus.registerSagas(sagas);
    this._queryBus.register(queries)
    return {commandBus: this._commandBus, eventBus: this._eventBus, queryBus: this._queryBus}
  }
}
