
# dependency-injection-typescript
[![Build Status](https://travis-ci.org/kpfromer/dependency-injection-typescript.svg?branch=master)](https://travis-ci.org/kpfromer/dependency-injection-typescript)
[![Coverage Status](https://coveralls.io/repos/github/kpfromer/dependency-injection-typescript/badge.svg?branch=master)](https://coveralls.io/github/kpfromer/dependency-injection-typescript?branch=master)

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
  providers: [NameGenerator]
})
export class AppModule {}
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

console.log(TestMod.getController(test).coolService.getVal());
```