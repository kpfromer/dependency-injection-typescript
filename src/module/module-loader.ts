
// TODO: get typings
export class ModuleLoader {
  static getController<T>(module: any, controller: new (...args) => T): T {
    return module.getController(controller);
  }
}