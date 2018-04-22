import { Injector } from './injector';

export const Service = (): GenericClassDecorator<Type<object>> => {
  return (target: Type<object>) => {
    Injector.addService(target);
  };
};
