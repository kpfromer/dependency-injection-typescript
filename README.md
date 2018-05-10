# dependency-injection-typescript
[![NPM](https://nodei.co/npm/inject-it-mod-it.png)](https://nodei.co/npm/inject-it-mod-it/)
[![Build Status](https://travis-ci.org/kpfromer/inject-it-mod-it.svg?branch=master)](https://travis-ci.org/kpfromer/inject-it-mod-it)
[![Coverage Status](https://coveralls.io/repos/github/kpfromer/inject-it-mod-it/badge.svg?branch=master)](https://coveralls.io/github/kpfromer/inject-it-mod-it?branch=master)

## Description

This is a simple dependency injection library.

## Usage

First create a module
```typescript
@Module({})
export class AppModule {}
```

Then add some dependencies
```typescript
@Service()
class NameGenerator {
  createName() {
    return 'John Doe';
  }
}

@Module({
  providers: [NameGenerator]
})
export class AppModule {}
```

Then add a controller class (a class that uses your dependencies)
```typescript
@Service()
class NameGenerator {
  createName() {
    return 'John Doe';
  }
}

@Controller()
class Conversation {
  constructor(private readonly nameGenerator: NameGenerator) {}

  startTalking() {
    console.log(`Hello ${this.nameGenerator.createName()}! How's it going?`);
  }
}

@Module({
  providers: [NameGenerator],
  controllers: [Conversation]
})
class AppModule {}

ModuleLoader.getController(AppModule, Conversation).startTalking();
```

Modules can import other modules:
```typescript
@Service()
class NameGenerator {
  createName() {
    return 'John Doe';
  }
}

@Module({
  providers: [NameGenerator],
  exports: [NameGenerator]
})
class NameModule {}

@Controller()
class Conversation {
  constructor(private readonly nameGenerator: NameGenerator) {}

  startTalking() {
    console.log(`Hello ${this.nameGenerator.createName()}! How's it going?`);
  }
}

@Module({
  imports: [NameModule]
})
export class AppModule {}
```

Note: modules **cannot** export controllers.

Example in context:
```typescript
@Service()
class Foo {
  constructor() {}

  getName() {
  return this.personName();
 }
  private personName() {
  return 'John Doe';
 }}

@Service()
class CoolService {
 constructor(@Inject('TestToken') private readonly name, private readonly foo: Foo) {}
 getVal() { return `Hey ${this.name}, what's with ${this.foo.getName()}?`; }}

@Module({
 providers: [CoolService, Foo, {
   provide: 'TestToken',
   useValue: 'Kyle Pfromer'
 }],
 exports: [CoolService]
})
export class AppModule {}


@Controller()
class test {
 constructor(public coolService: CoolService) {
 }
}

@Module({
 imports: [AppModule], controllers: [test]
})
class TestMod {}

console.log(ModuleLoader.getController(TestMod, test).coolService.getVal().coolService.getVal());
```

Module take the following parameters:
```typescript
@Module({
  imports: [/* Other Modules */],
  controllers: [/* Controllers */],
  providers: [/* services or token providers */],
  exports: [/* services or token providers */]
})
```

#### You can have custom token providers

All of the following providers are valid

```typescript
class ToBeOverriden {}

class NewClass {}

const ValueProvider = {
  provide: 'NameToken',
  useValue: 'John Doe'
};
const ClassProvider = {
  provide: ToBeOverriden,
  useClass: NewClass
};
const FactoryProivder = {
  provide: 'Factory'
  useFactory: (name: string) => `Hello ${name}`
  deps: ['NameToken']
};

@Module({
  providers: [
    ValueProvider,
    ClassProvider,
    FactoryProivder
  ]
})
class ExampleModule {}
```

## License

  inject-it-mod-it is [MIT licensed](LICENSE).