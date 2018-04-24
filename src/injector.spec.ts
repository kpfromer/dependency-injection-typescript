import 'reflect-metadata';
import * as inject from './inject';
import * as provider from './provider';
import { InjectorItem } from './injector';
import { getInjectMetadataForParam, Inject } from './inject';

describe('Injector', () => {
  let injector: InjectorItem;

  beforeEach(() => {
    injector = new InjectorItem();
  });

  describe('resolve', () => {
    it('should recursively get dependencies', () => {
      class Foo {
        constructor() {}
      }

      const decotator = () => (target) => {};

      @decotator()
      class Foobar {
        constructor(/* Inject CoolToken */ public coolToken: string, private foo: Foo) {}
        getName() {
          return `Hello ${this.coolToken}`;
        }
      }

      injector.addService(Foobar);

      jest.spyOn(injector, 'resolveInjectParameters').mockImplementation(() => {
        return (token, index) => {
          if (index === 0) {
            return 'cool token is cool';
          }

          return token;
        }
      });

      jest.spyOn(injector, 'resolveArray').mockImplementation(() => {
        return (token, index) => {
          if (index === 0) {
            return token;
          }

          return new token();
        }
      });

      const value = injector.resolve<Foobar>(Foobar);

      expect(value).toBeInstanceOf(Foobar);
      expect(value.getName()).toBe('Hello cool token is cool')
    });
  });

  describe('resolveInjectParameters', () => {
    it('should return @Inject token names', () => {
      jest.spyOn(inject, 'getInjectMetadataForParam').mockReturnValue('CoolToken');

      class TokenClass {
        constructor(iWillBeInjected: string) {}
      }
      injector.addService(TokenClass);

      const value = injector.resolveInjectParameters(TokenClass)(String, 0);

      expect(inject.getInjectMetadataForParam).toHaveBeenCalledWith(TokenClass, 0);
      expect(value).toBe('CoolToken');
    });

    it('should return Service if it is not @Inject', () => {
      jest.spyOn(inject, 'getInjectMetadataForParam').mockReturnValue(undefined);

      // In reality this should be added to injector, but in this test it is not needed
      class CoolService {}

      class TokenClass {
        constructor(iWillBeInjected: CoolService) {}
      }
      injector.addService(TokenClass);

      const value = injector.resolveInjectParameters(TokenClass)(CoolService, 0);

      expect(inject.getInjectMetadataForParam).toHaveBeenCalledWith(TokenClass, 0);
      expect(value).toBe(CoolService);
    });
  });

  describe('resolveArray', () => {
    it('should resolve a provider', () => {
      const mockProvider = jest.fn().mockReturnValue('Hello World!');

      jest.spyOn(provider, 'Provider').mockImplementation(() => {
        return {
          name: 'tokenname',
          getValue: mockProvider
        }
      });

      injector.addToken({
        provide: 'tokenname',
        useValue: 'Hello World!'
      });

      const value = injector.resolveArray()('tokenname', 0);

      expect(mockProvider).toHaveBeenCalled();
      expect(value).toBe('Hello World!');
    });

    it('should resolve a service', () => {
      class AService {
        constructor(public name: string) {}
      }

      const service = new AService('hello, world');

      jest.spyOn(injector, 'resolve').mockReturnValue(service);

      injector.addService(AService);

      const value = injector.resolveArray()(AService, 0);

      expect(injector.resolve).toHaveBeenCalledWith(AService);
      expect(value).toBe(service);
    });

    it('should throw error if there is no service found', () => {
      const handler = () => {

        class NotAService {}

        injector.resolveArray()(new NotAService(), 1);
      };

      expect(handler).toThrowError('[1] Unresolved parameter of type: NotAService');
    });
  });
});
