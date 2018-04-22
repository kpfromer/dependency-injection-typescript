import { Injector } from './injector';
import { Service } from './service';

describe('Service', () => {
  beforeEach(() => {
    jest.spyOn(Injector, 'addService');
  });

  it('should add class to Injector', () => {
    @Service()
    class NewService {}

    expect(Injector.addService).toHaveBeenCalledWith(NewService);
  });
});
