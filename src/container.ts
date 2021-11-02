import 'reflect-metadata'

import {Container} from 'inversify'
import { TYPES } from './types'
import {EventPublisher} from "./event-publisher";
import {CommandBus} from "./command-bus";
import {CQRSModule, ICQRSModule} from "./cqrs.module";
import {EventBus} from "./event-bus";
import {QueryBus} from "./query-bus";

const container = new Container({ skipBaseClassChecks: true })

container.bind<ICQRSModule>(TYPES.CQRSModule).to(CQRSModule).inSingletonScope()
container.bind(TYPES.CommandBus).to(CommandBus).inSingletonScope()
container.bind(TYPES.QueryBus).to(QueryBus).inSingletonScope()
container.bind(TYPES.EventBus).to(EventBus).inSingletonScope()
container.bind(TYPES.EventPublisher).to(EventPublisher).inSingletonScope()

export const CQRSContainer = container
