import 'reflect-metadata';
import { SERVICE_METADATA } from './constants';

export const isService = (target): boolean => {
  return Reflect.getMetadata(SERVICE_METADATA, target);
};

export const Service = (): GenericClassDecorator<Type<object>> => {
  return (target: Type<object>) => {
    Reflect.defineMetadata(SERVICE_METADATA, true, target);
  };
};
