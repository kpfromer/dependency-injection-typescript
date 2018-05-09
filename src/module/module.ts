import { InjectorItem } from '../injector';
import { Provider } from '../provider';
import { get } from 'lodash';
import { isTokenProvider } from '../types/token.provider';
import { isService } from '../service';
import { isController } from '../controller/controller';
import { MODULE_METADATA } from '../constants';

interface IModule {
  getController<T>(): new (...args) => T;
  getExports(): (Type<any> | Provider<any>)[];
}

type ModuleMetadata = {
  imports?: any[],
  providers?: any[],
  controllers?: any[],
  exports?: any[]
}

type ModuleDecorator<T> = (target: T) => any;

export const isModule = (target: any): target is IModule => {
  return Reflect.getMetadata(MODULE_METADATA, target);
};

export const Module = (metadata: ModuleMetadata) => {
  // TODO: should build deps ahead of time to save time (to stop resolve everytime you need something)
  return (target: Type<object>) => {

    // TODO Check that imports providers and controllers are valid! (using metadata)

    const injector = new InjectorItem();

    get(metadata, 'imports', []).forEach(module => {
      if (!isModule(module)) {
        throw new TypeError(`Invalid import: ${module.name} in module: ${target.name}`);
      }

      module.getExports().forEach(provider => injector.addServiceOrToken(provider));
    });

    get(metadata, 'providers', []).forEach(provider => {
      if (!isService(provider) && !isTokenProvider(provider)) {
        throw new TypeError(`Invalid service/provider ${provider.name} in module: ${target.name}`);
      }
      injector.addServiceOrToken(provider);
    });

    get(metadata, 'controllers', []).forEach(controller => {
      if (!isController(controller)) {
        throw new TypeError(`Invalid controller ${controller.name} in module: ${target.name}`);
      }
    });

    const exportedProviders = Array.from(get(metadata, 'exports', []).reduce((prevSet, exportedProvider) => {
      if (!isService(exportedProvider) && !isTokenProvider(exportedProvider)) {
        throw new TypeError(`Invalid exported service/provider ${exportedProvider.name} in module: ${target.name}`);
      }
      
      // TODO if is exports it must be in providers
      return new Set([...prevSet, ...injector.resolveDeps(exportedProvider)]);
    }, new Set([])));

    // TODO: if providers is attached

    Reflect.defineMetadata(MODULE_METADATA, true, target);

    return class extends target {

      private static injector = injector;
      private static controllers: any[] = get(metadata, 'controllers', []);
      private static exportedProviders = exportedProviders;

      public static getController<T>(controller: new (...args) => T): T {
        if (this.controllers.includes(controller)) {
          return this.injector.resolve<T>(controller);
        }

        throw new TypeError(`No such controller: ${controller.name} defined in module: ${target.name}`);
      }

      public static getExports() {
        return this.exportedProviders;
      }
    }
  };
};
