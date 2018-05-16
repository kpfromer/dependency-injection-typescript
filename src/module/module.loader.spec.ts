import * as moduledec from './module';
import { ModuleLoader } from './module.loader';

describe('ModuleLoader', () => {
  describe('getController', () => {
    it('should throw error if module given is invalid', () => {
      jest.spyOn(moduledec, 'isModule').mockReturnValue(false);

      class InvalidModule {}
      class WantedController {}

      const handler = () => {
        ModuleLoader.getController(InvalidModule, WantedController);
      };

      expect(handler).toThrow(TypeError);
    });

    it('should get controller from module', () => {
      jest.spyOn(moduledec, 'isModule').mockReturnValue(true);

      const mockController = jest.fn();

      class WantedController {}
      class Module {
        static getController() {
          return mockController;
        }
      }

      const controller = ModuleLoader.getController(Module, WantedController);

      expect(controller).toBe(mockController);
    });
  });
});