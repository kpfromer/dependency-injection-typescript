import 'reflect-metadata'
import { Controller } from './controller';
import { CONTROLLER_METADATA } from '../constants';

describe('Controller', () => {
  it('should set class as a controller', () => {
    @Controller()
    class controller {}

    expect(Reflect.getMetadata(CONTROLLER_METADATA, controller)).toBe(true);
  });
});