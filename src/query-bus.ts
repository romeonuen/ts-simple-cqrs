import {
  ICommandHandler,
  IEventHandler,
  IQuery,
  IQueryBus,
  IQueryHandler,
  IQueryPublisher,
  IQueryResult,
  Type
} from "./interfaces";
import {ObservableBus} from "./utils";
import {
  QueryHandlerNotFoundException
} from "./exceptions";
import {QUERY_HANDLER_METADATA} from "./decorators/constants";
import {DefaultQueryPubSub} from "./helpers/default-query-pubsub";
import {injectable} from "inversify";
import {CQRSContainer} from "./container";

export type QueryHandlerType<
  QueryBase extends IQuery = IQuery,
  QueryResultBase extends IQueryResult = IQueryResult
> = Type<IQueryHandler<QueryBase, QueryResultBase>>;

@injectable()
export class QueryBus<QueryBase extends IQuery = IQuery>
  extends ObservableBus<QueryBase>
  implements IQueryBus<QueryBase> {
  private _publisher: IQueryPublisher<QueryBase>;

  constructor() {
    super();
    this.useDefaultPublisher();
  }

  get publisher(): IQueryPublisher<QueryBase> {
    return this._publisher;
  }

  set publisher(_publisher: IQueryPublisher<QueryBase>) {
    this._publisher = _publisher;
  }

  async execute<T extends QueryBase, TResult = any>(query: T,): Promise<TResult> {
    const handlerType = Reflect.getMetadata(QUERY_HANDLER_METADATA, query)

    const handler = CQRSContainer.get(handlerType) as IQueryHandler<T>
    if (!handler) {
      throw new QueryHandlerNotFoundException(this.getQueryName(query as any));
    }

    this.subject$.next(query);
    const result = await handler.execute(query);
    return result as TResult;
  }

  register(handlers: QueryHandlerType[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  private registerHandler(handler: QueryHandlerType) {
    CQRSContainer.bind(handler).toSelf();
  }

  private getQueryName(query: Function): string {
    const { constructor } = Object.getPrototypeOf(query);
    return constructor.name as string;
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultQueryPubSub<QueryBase>(this.subject$);
  }
}
