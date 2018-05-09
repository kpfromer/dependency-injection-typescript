import { CONTROLLER_METADATA } from '../constants';

export const isController = (target): boolean => {
  return Reflect.getMetadata(CONTROLLER_METADATA, target);
};

export const Controller = (): GenericClassDecorator<Type<object>> => {
  return (target: Type<object>) => {
    Reflect.defineMetadata(CONTROLLER_METADATA, true, target);
  };
};
