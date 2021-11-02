/*
 * Nest CQRS Module custom for any typescript projects
 * Copyright(c) 2017-... Kamil Mysliwiec
 * www.kamilmysliwiec.com
 * MIT Licensed
 * Custom by Romeo Nguyen
 */

import {CQRSContainer} from "./container";
import {ServiceType, ICQRSModule} from "./cqrs.module";
import {TYPES} from "./types";
import {ICommandBus, IEventBus, IQueryBus} from "./interfaces";

export * from './aggregate-root';
export * from './command-bus';
export * from './cqrs.module';
export * from './decorators';
export * from './exceptions';
export * from './interfaces';
export * from './operators';
export * from './utils';

export type SimpleCQRSType = {
  commandBus: ICommandBus,
  queryBus: IQueryBus,
  eventBus: IEventBus,
}

export const SimpleCQRS = {
  exploreServices(handler: ServiceType): SimpleCQRSType {
    const cqrs = CQRSContainer.get<ICQRSModule>(TYPES.CQRSModule);
    return cqrs.explore(handler);
  }
}
