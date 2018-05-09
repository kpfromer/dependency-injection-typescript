import { Module } from './module';
import { CONTROLLER_METADATA, MODULE_METADATA, SERVICE_METADATA } from '../constants';
import * as injector from '../injector/injector';

describe('Module', () => {

  const setAsService = service => Reflect.defineMetadata(SERVICE_METADATA, true, service);
  const setAsController = controller => Reflect.defineMetadata(CONTROLLER_METADATA, true, controller);
  const setAsModule = module => Reflect.defineMetadata(MODULE_METADATA, true, module);

  it('should set module metadata', () => {
    @Module({})
    class module {}

    expect(Reflect.getMetadata(MODULE_METADATA, module)).toBe(true);
  });

  it('should provide services', () => {
    class Bar {
      constructor() {
      }
    }

    setAsService(Bar);

    const servicesOrTokens = [];

    jest.spyOn(injector, 'InjectorItem').mockImplementation(() => ({
      addServiceOrToken: item => servicesOrTokens.push(item)
    }));

    @Module({
      providers: [Bar]
    })
    class CoolApp {
    }

    expect(injector.InjectorItem).toHaveBeenCalledTimes(1);
    expect(servicesOrTokens).toEqual([Bar]);
  });


  it('should provide tokens as Providers', () => {
    const servicesOrTokens = [];

    jest.spyOn(injector, 'InjectorItem').mockImplementation(() => ({
      addServiceOrToken: item => servicesOrTokens.push(item)
    }));

    const token = {
      provide: 'hello',
      useValue: 'world'
    };

    @Module({
      providers: [token]
    })
    class CoolApp {
    }

    expect(injector.InjectorItem).toHaveBeenCalledTimes(1);
    expect(servicesOrTokens).toEqual([token])
  });

  it('should provide services/providers from imported module\'s exports', () => {
    const servicesOrTokens = [];

    jest.spyOn(injector, 'InjectorItem').mockImplementation(() => ({
      addServiceOrToken: item => servicesOrTokens.push(item)
    }));

    const subModuleProviders = [
      {
        provide: 'hello',
        useValue: 'world'
      },
      {
        provide: 'Another Token',
        useValue: 'token'
      }
    ];

    class SubModule {
      static getExports() {
        return subModuleProviders;
      }
    }

    setAsModule(SubModule);

    class CoolAppService {
    }

    setAsService(CoolAppService);

    @Module({
      imports: [SubModule],
      providers: [CoolAppService]
    })
    class CoolApp {
    }

    expect(injector.InjectorItem).toHaveBeenCalledTimes(1);
    expect(servicesOrTokens).toEqual([...subModuleProviders, CoolAppService].sort());
  });

  it('should error if import is not a module', () => {
    class InvalidModule {}

    const handler = () => {
      @Module({
        imports: [InvalidModule]
      })
      class CoolApp {
      }
    };

    expect(handler).toThrow(TypeError);
  });

  it('should error if exports contain items not listed in providers', () => {
    class CoolAppService {
    }

    setAsService(CoolAppService);

    const handler = () => {
      @Module({
        exports: [CoolAppService]
      })
      class CoolApp {
      }
    };

    expect(handler).toThrow(TypeError);
  });

  it('should error if exported providers are not valid', () => {
    class InvalidTokenAndService {}

    const handler = () => {
      @Module({
        exports: [InvalidTokenAndService]
      })
      class CoolApp {
      }
    };

    expect(handler).toThrow(TypeError);
  });

  it('should error if a provider is not a service or a token provider', () => {
    class IAmInvalid {
      constructor() {
      }
    }

    jest.spyOn(injector, 'InjectorItem').mockImplementation(() => ({
      addServiceOrToken: service => {}
    }));

    const handler = () => {
      @Module({
        providers: [IAmInvalid]
      })
      class CoolApp {
      }
    };

    expect(handler).toThrow(TypeError);
  });

  it('should error if controller is not a controller', () => {
    class InvalidController {}

    const handler = () => {
      @Module({
        controllers: [InvalidController]
      })
      class CoolApp {
      }
    };

    expect(handler).toThrow(TypeError);
  });

  describe('getExports', () => {
    it('should return exports for the module', () => {
      class AService {
      }
      setAsService(AService);

      class BService {
      }
      setAsService(BService);

      @Module({
        providers: [AService, BService],
        exports: [AService, BService]
      })
      class CoolModule {
      }

      const exports = CoolModule.getExports().sort();

      expect(exports).toEqual([AService, BService].sort());
    });
  });

  describe('getController', () => {
    it('should resolve the controller using it\s internal InjectorItem', () => {
      class MockController {}
      setAsController(MockController);

      const mockResolve = jest.fn().mockReturnValue(new MockController());

      jest.spyOn(injector, 'InjectorItem').mockImplementation(() => ({
        addServiceOrToken: item => {},
        resolve: mockResolve
      }));

      @Module({
        controllers: [MockController]
      })
      class CoolModule {}

      const controller = CoolModule.getController(MockController);

      expect(controller).toBeInstanceOf(MockController);
      expect(mockResolve).toHaveBeenCalledWith(MockController);
    });

    it('should error if controller is not added to module', () => {
      class MockController {}
      setAsController(MockController);

      const mockResolve = jest.fn();

      jest.spyOn(injector, 'InjectorItem').mockImplementation(() => ({
        addServiceOrToken: item => {},
        resolve: mockResolve
      }));

      @Module({})
      class CoolModule {}

      const handler = () => {
        CoolModule.getController(MockController)
      };

      expect(handler).toThrow(TypeError);
      expect(mockResolve).not.toHaveBeenCalled();
    });
  });
});