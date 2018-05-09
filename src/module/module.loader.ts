import { isModule } from './module';

export class ModuleLoader {
  static getController<T>(module: any, controller: new (...args) => T): T {
    if (!isModule(module)) {
      throw new TypeError('Invalid Module');
    }

    return module.getController(controller);
  }
}