# ts-simple-cqrs
Custom [Nest CQRS Module](https://github.com/nestjs/cqrs) for any javascript projects

# Installation
```
npm i --save ts-simple-cqrs
```
# Usage
### Required knownledge
Family with typescript decorator and [InversifyJS](https://github.com/inversify/InversifyJS)

```javascript
// TestCommand.ts
import {ICommand} from "ts-simple-cqrs";

export class TestCommand implements ICommand {
  constructor(public readonly name: string) {}
}

// TestCommandHandler.ts
import {injectable} from "inversify";
import {CommandHandler, ICommandHandler} from "ts-simple-cqrs";
import {TestCommand} from "./TestCommand";

@injectable()
@CommandHandler(TestCommand)
export class TestCommandHandler implements ICommandHandler<TestCommand> {
  execute(command: TestCommand): Promise<any> {
    return Promise.resolve('hello ' + command.name);
  }
}

// main.ts
import {SimpleCQRS} from "ts-simple-cqrs";
import {TestCommandHandler} from "./TestCommandHander";
import {TestCommand} from "./TestCommand";

const services = {
  commands: [TestCommandHandler],
  queries: [],
  events: [],
  sagas: []
}

const { commandBus, eventBus, queryBus } = SimpleCQRS.exploreServices(services)
commandBus.execute(new TestCommand('romeo')).then(val => console.log(val))
// output: hello romeo
```
## Explain
1. Everything is exactly the same as how Nest CQRS did except using `@injectable()` decorator for all handlers to register with Inversify container
2. You can pass `commandBus, eventBus, queryBus` to anywhere to use.
3. If you want to inject them to some other classes directly(like Nest), you have to follow the [InversifyJS](https://github.com/inversify/InversifyJS). Something like below:
```javascript
import {SimpleCQRS} from "ts-simple-cqrs";
import {TestCommandHandler} from "./TestCommandHander";
import {TestCommand} from "./TestCommand";
import {inject, injectable} from "inversify";
import {TYPES} from "ts-simple-cqrs/types";
import {CQRSContainer} from "ts-simple-cqrs/container";

// define services
const services = {
  commands: [TestCommandHandler],
  queries: [],
  events: [],
  sagas: []
}
// init cqrs
SimpleCQRS.exploreServices(services)

// write your class
@injectable()
class MySomethingClass {
  constructor(@inject(TYPES.CommandBus) private readonly commandBus) {}
  sayHello() {
    this.commandBus.execute(new TestCommand('romeo')).then(val => console.log(val))
  }
}

// define your type
const MY_TYPES = {
  MySomethingClass: Symbol.for('MySomethingClass'),
}

// register to CQRSContainer
CQRSContainer.bind<MySomethingClass>(MY_TYPES.MySomethingClass).to(MySomethingClass)

// main
CQRSContainer.get<MySomethingClass>(MY_TYPES.MySomethingClass).sayHello()
// output: hello romeo
```
# Contributing
updating...
