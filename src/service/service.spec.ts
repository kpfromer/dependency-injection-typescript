import 'reflect-metadata';
import { isService, Service } from './service';
import { SERVICE_METADATA } from '../constants';


describe('isService', () => {
  it('should return true if class is service', () => {
    class AService {}

    Reflect.defineMetadata(SERVICE_METADATA, true, AService);

    expect(isService(AService)).toBe(true);
  });

  it('should return false if class in not service', () => {
    class NotService {}

    expect(isService(NotService)).toBe(false);
  });
});

describe('Service', () => {
  it('should add class to Injector', () => {
    @Service()
    class NewService {}

    expect(Reflect.getMetadata(SERVICE_METADATA, NewService)).toBe(true);
  });
});
