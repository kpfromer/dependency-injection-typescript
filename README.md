
# dependency-injection-typescript
[![Build Status](https://travis-ci.org/kpfromer/dependency-injection-typescript.svg?branch=master)](https://travis-ci.org/kpfromer/dependency-injection-typescript)
[![Coverage Status](https://coveralls.io/repos/github/kpfromer/dependency-injection-typescript/badge.svg?branch=master)](https://coveralls.io/github/kpfromer/dependency-injection-typescript?branch=master)

## Description

This is a simple dependency injection library.

## Usage
```typescript
import 'reflect-metadata';
import { Service } from './service';
import { Injector } from './injector';
import { Inject, InjectKey } from './inject';

Injector.addToken({
  provide: 'TestToken',
  useValue: 'big boy kyle'
});

Injector.addToken({
  provide: 'NameToken',
  useValue: new class {
  get() {
  return 'hello';
 } }()});

class User {
  username = 'kyle pfromer';
}

class NewUser {
  username = 'i am edited';
  getName() {
  return `${this.name} is cool`;
 }  constructor(@Inject('factory') private name: string) {}
}

Injector.addToken({
  provide: User,
  useClass: NewUser
});

Injector.addToken({
  provide: 'factory',
  useFactory: () => 'i am a factory'
});

Injector.addToken({
  provide: 'UsefulFactory',
  useFactory: (user: User, factory) => {
  return `hello ${user.getName()} ${factory}`;
 },  deps: [User, 'factory']
});

// Without having the service decorator the class will not be defined in the global metadata map
// thus Injector will not be able to finds its constructor properties for it
@Service()
class Foo {
  constructor(@Inject('TestToken') private name: string) {}
  getName() {
  return this.name;
 }}

@Service()
class Bar {
  constructor(@Inject('NameToken') private foo: Foo) {}
  test() {
  return `hello, world. I am ${this.foo.get()}!`;
 }}

@Service()
class Foobar {
  constructor(
  @Inject('factory') public factory: string,
  public foo: Foo,
  public bar: User,
  @Inject('UsefulFactory') public coolFactory
  ) {}
}

const foobar = Injector.resolve<Foobar>(Foobar);

console.log(foobar.factory); // i am a factory
console.log(foobar.coolFactory); // hello i am a factory is cool i am a factory
```