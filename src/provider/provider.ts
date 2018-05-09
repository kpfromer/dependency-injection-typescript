import { InjectorItem } from '../injector/injector';
import {
  Factory,
  instanceOfClassProvider,
  instanceOfFactoryProvider,
  instanceOfValueProvider,
  TokenProvider
} from '../types/token.provider';

enum ProviderType {
  VALUE,
  CLASS,
  FACTORY
}

export class Provider<T> {
  public readonly name: string | Type<any>;

  private readonly value: T | Type<T> | Factory<T>;
  private readonly deps?: any[];
  private readonly type: ProviderType;

  constructor(provider: TokenProvider<T>) {
    this.name = provider.provide;

    this.deps = [];

    if (instanceOfValueProvider(provider)) {
      this.type = ProviderType.VALUE;
      this.value = provider.useValue;
    } else if (instanceOfClassProvider(provider)) {
      this.type = ProviderType.CLASS;
      this.value = provider.useClass;
    } else if (instanceOfFactoryProvider(provider)) {
      this.type = ProviderType.FACTORY;
      this.deps = provider.deps ? provider.deps : [];
      this.value = provider.useFactory;
    } else {
      throw new Error('Unknown token type!');
    }
  }

  getDeps() {
    return this.deps;
  }

  getValue(injector: InjectorItem): T | Type<T> {
    if (this.type === ProviderType.VALUE) {
      return this.value as T;
    } else if (this.type === ProviderType.CLASS) {
      return injector.resolve(this.value as Type<T>);
    } else if (this.type === ProviderType.FACTORY) {
      const deps = this.deps.map(injector.resolveArray());
      return (this.value as Factory<T>)(...deps);
    } else {
      throw new TypeError('Unknown Type!');
    }
  }
}
