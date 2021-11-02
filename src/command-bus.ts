import 'reflect-metadata';
import { COMMAND_HANDLER_METADATA } from './decorators/constants';
import { CommandHandlerNotFoundException } from './exceptions';
import { DefaultCommandPubSub } from './helpers/default-command-pubsub';
import {
  ICommand,
  ICommandBus,
  ICommandHandler,
  ICommandPublisher, Type,
} from './interfaces';
import { ObservableBus } from './utils';
import { CQRSContainer } from './container'
import {injectable} from "inversify";

export type CommandHandlerType = Type<ICommandHandler<ICommand>>;

@injectable()
export class CommandBus<CommandBase extends ICommand = ICommand> extends ObservableBus<CommandBase> implements ICommandBus<CommandBase> {
  private _publisher: ICommandPublisher<CommandBase>;

  constructor() {
    super();
    this.useDefaultPublisher();
    console.log('command bus created')
  }

  execute<T extends CommandBase, R = any>(command: T): Promise<R> {
    const handlerType = Reflect.getMetadata(COMMAND_HANDLER_METADATA, command)

    const handler = CQRSContainer.get(handlerType) as ICommandHandler<T>
    if (!handler) {
      throw new CommandHandlerNotFoundException(this.getCommandName(command as any));
    }

    this.subject$.next(command);
    return handler.execute(command);
  }

  register(handlers: CommandHandlerType[] = []) {
    handlers.forEach((handler) => this.registerHandler(handler));
  }

  private registerHandler(handler: CommandHandlerType) {
    CQRSContainer.bind(handler).toSelf();
  }

  private getCommandName(command: Function): string {
    const { constructor } = Object.getPrototypeOf(command);
    return constructor.name as string;
  }

  private useDefaultPublisher() {
    this._publisher = new DefaultCommandPubSub<CommandBase>(this.subject$);
  }
}
