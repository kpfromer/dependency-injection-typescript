import { Injector } from '../injector';

export type ValueProvider<T> = {
  provide: string;
  useValue: T;
};

export type ClassProvider<T> = {
  provide: Type<any>;
  useClass: Type<T>;
};

export type Factory<T> = (...dep) => T;

export type FactoryProvider<T> = {
  provide: string;
  useFactory: Factory<T>;
  deps?: any[];
};

export function instanceOfValueProvider(
  object: any
): object is ValueProvider<any> {
  return 'useValue' in object;
}

export function instanceOfClassProvider(
  object: any
): object is ClassProvider<any> {
  return 'useClass' in object;
}

export function instanceOfFactoryProvider(
  object: any
): object is FactoryProvider<any> {
  return 'useFactory' in object;
}

export function isTokenProvider(object: any): object is TokenProvider<any> {
  return instanceOfValueProvider(object) || instanceOfClassProvider(object) || instanceOfFactoryProvider(object);
}

export type TokenProvider<T> =
  | ClassProvider<T>
  | ValueProvider<T>
  | FactoryProvider<T>;
