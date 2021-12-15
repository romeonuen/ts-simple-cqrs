import {CommandHandler, QueryHandler, ICommand, ICommandHandler, IQuery, IQueryHandler, SimpleCQRS, SimpleCQRSType} from "./src";
import {injectable} from "inversify";

class TestCommand implements ICommand {
  constructor(public readonly name: string) {
  }
}

@injectable()
@CommandHandler(TestCommand)
class TestHandler implements ICommandHandler<TestCommand, void> {
  // @ts-ignore
  execute(command: TestCommand): Promise<void> {
    console.log(command.name)
  }
}

class GetTestQuery implements IQuery {}

@injectable()
@QueryHandler(GetTestQuery)
class GetTestHandler implements IQueryHandler<GetTestQuery, string> {
  execute(command: GetTestQuery): Promise<string> {
    return Promise.resolve("romeo")
  }
}

const {commandBus, queryBus}: SimpleCQRSType = SimpleCQRS.exploreServices({
  commands: [TestHandler],
  events: [],
  queries: [GetTestHandler],
  sagas: [],
});

commandBus.execute(new TestCommand("romeo"))
queryBus.execute(new GetTestQuery())
