import 'reflect-metadata';
import * as inject from './inject';
import { Provider } from './provider';
import * as provider from './provider';
import { InjectorItem } from './injector';
import * as tokenProvider from './types/token.provider';
import { getInjectMetadataForParam} from './inject';

describe('Injector', () => {
  let injector: InjectorItem;

  beforeEach(() => {
    injector = new InjectorItem();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resolve', () => {
    it('should recursively get dependencies', () => {
      class Foo {
        constructor() {}
      }

      const decorator = () => (target) => {};

      @decorator()
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

  describe('resolveDeps', () => {
    it('should flatten dependency map', () => {

      const decorator = () => (target) => {};

      @decorator()
      class A {}
      @decorator()
      class B {
        constructor(public coolService: A) {}
      }
      @decorator()
      class C {
        constructor(public bService: B, public injectParam) {}
      }

      injector.addService(A);
      injector.addService(B);
      injector.addService(C);

      const mockProvider = new Provider({
        provide: 'token',
        useValue: 'item'
      });

      injector.addProvider(mockProvider);

      jest.spyOn(injector, 'resolveInjectParameters').mockImplementation((target) => (token, index) => target === C && index === 1 ? 'token' : token);

      const deps = injector.resolveDeps(C);

      expect(deps.sort()).toEqual([A, B, C, mockProvider].sort());
    });

    it('should remove duplicate dependencies', () => {

      const decorator = () => (target) => {};

      @decorator()
      class A {}
      @decorator()
      class B {
        constructor(public aService: A, public duplicateAService: A) {}
      }

      injector.addService(A);
      injector.addService(B);

      jest.spyOn(injector, 'resolveInjectParameters').mockImplementation((target) => (token, index) => token);

      const deps = injector.resolveDeps(B);

      expect(deps.sort()).toEqual([A, B].sort());
    });

    it('should error if a dependency doesn\'t exist', () => {

      class NotAddedService {}

      class A {
        constructor(public invalidService: NotAddedService) {}
      }

      const handlerA = () => injector.resolveDeps(A);

      jest.spyOn(injector, 'resolveInjectParameters').mockReturnValue((token, index) => index === 0 ? 'invalid Inject' : undefined);

      class B {
        constructor(invalidService) {}
      }

      const handlerB = () => injector.resolveDeps(B);

      expect(handlerA).toThrowError(TypeError);
      expect(handlerB).toThrowError(TypeError);
    });
  });

  describe('addServiceOrToken', () => {
    it('should add Provider', () => {
      jest.spyOn(tokenProvider, 'isTokenProvider').mockReturnValue(false);
      jest.spyOn(injector, 'addProvider');

      const mockProvider = new Provider({
        provide: 'mock',
        useValue: 'mock'
      });

      injector.addServiceOrToken(mockProvider);

      expect(injector.addProvider).toHaveBeenCalledWith(mockProvider);
    });

    it('should add Service', () => {
      jest.spyOn(tokenProvider, 'isTokenProvider').mockReturnValue(false);
      jest.spyOn(injector, 'addService');

      class AService {}

      injector.addServiceOrToken(AService);

      expect(injector.addService).toHaveBeenCalledWith(AService);
    });

    it('should add plain token provider', () => {
      jest.spyOn(tokenProvider, 'isTokenProvider').mockReturnValue(true);
    });
  });
});
