import {EventPublisher} from "./event-publisher";

const TYPES = {
  CQRSModule: Symbol.for('CQRSModule'),
  CommandBus: Symbol.for('CommandBus'),
  EventBus: Symbol.for('EventBus'),
  QueryBus: Symbol.for('QueryBus'),
  EventPublisher: Symbol.for('EventPublisher'),
}

export { TYPES }
