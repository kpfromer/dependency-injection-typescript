import { InjectorItem } from '../injector/injector';
import { Provider } from '../provider/provider';
import { get } from 'lodash';
import { isService } from '../service/service';
import { isController } from '../controller/controller';
import { MODULE_METADATA } from '../constants';
import { TokenProvider } from '../types/token.provider';

export interface IModule {
  getController<T>(contoller: new (...args) => T): T;
  getExports(): (Type<any> | Provider<any>)[];
}

export type ModuleMetadata = {
  imports?: any[],
  providers?: any[],
  controllers?: any[],
  exports?: any[]
}

export const isModule = (target: any): target is IModule => {
  return Reflect.getMetadata(MODULE_METADATA, target);
};

export const Module = (metadata: ModuleMetadata) => {
  return (target: Type<object>) => {

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

      return new Set([...prevSet, ...injector.resolveDeps(exportedProvider)]);
    }, new Set([])));

    Reflect.defineMetadata(MODULE_METADATA, true, target);

    return class extends target {

      static injector = injector;
      static controllers: any[] = get(metadata, 'controllers', []);

      public static getController<T>(controller: new (...args) => T): T {
        if (this.controllers.includes(controller)) {
          return this.injector.resolve<T>(controller);
        }

        throw new TypeError(`No such controller: ${controller.name} defined in module: ${target.name}`);
      }

      public static getExports() {
        return exportedProviders;
      }
    }
  };
};
