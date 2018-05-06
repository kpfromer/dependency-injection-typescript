import 'reflect-metadata';
import { Service } from './service';
import { SERVICE_METADATA } from './constants';

describe('Service', () => {
  it('should add class to Injector', () => {
    @Service()
    class NewService {}

    expect(Reflect.getMetadata(SERVICE_METADATA, NewService)).toBe(true);
  });
});
