import { Inject, InjectKey } from './inject';
import 'reflect-metadata';

describe('Inject', () => {
  it('should throw error if applied on anything but the constructor', () => {
    const handler = () => {
      class InvalidClass {
        definitelyNotConstructor(@Inject('Item') item: string) {}
      }
    };

    expect(handler).toThrowError(
      "Can't apply Inject decorator for anything but the constructor"
    );
  });

  it('should define metadata of map of parameter index to token string', () => {
    class OtherClass {}
    class ValidClass {
      constructor(
        @Inject('Item') item: string,
        item2: OtherClass,
        @Inject('item3') item3: boolean
      ) {}
    }

    expect(Reflect.getMetadata(InjectKey, ValidClass)).toEqual(
      new Map([[0, 'Item'], [2, 'item3']])
    );
  });
});
