import * as inject from './inject';
import 'reflect-metadata';

describe('Inject', () => {
  it('should throw error if applied on anything but the constructor', () => {
    const handler = () => {
      class InvalidClass {
        definitelyNotConstructor(@inject.Inject('Item') item: string) {}
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
        @inject.Inject('Item') item: string,
        item2: OtherClass,
        @inject.Inject('item3') item3: boolean
      ) {}
    }

    expect(Reflect.getMetadata(inject.InjectKey, ValidClass)).toEqual(
      new Map([[0, 'Item'], [2, 'item3']])
    );
  });
});

describe('getInjectMetadata', () => {
  it('should return metadata', () => {
    class OtherClass {}
    class ValidClass {
      constructor(
        @inject.Inject('Item') item: string,
        item2: OtherClass,
        @inject.Inject('item3') item3: boolean
      ) {}
    }

    expect(inject.getInjectMetadata(ValidClass)).toEqual(
      new Map([[0, 'Item'], [2, 'item3']])
    );
  });

  it('should return null if there is no metadata', () => {
    class NoInjectedClass {
      constructor(nothing: string) {}
    }

    expect(inject.getInjectMetadata(NoInjectedClass)).toBeUndefined();
  });
});

describe('getInjectMetadataForParam', () => {
  it('should return metadata string', () => {
    jest.spyOn(inject, 'getInjectMetadata').mockReturnValue(new Map([
      [0, 'item1'],
      [2, 'cool item']
    ]));

    class ValidClass {
      constructor(
        @inject.Inject('item1') item: string,
        item2: string,
        @inject.Inject('item2') item3: boolean
      ) {}
    }

    const value = inject.getInjectMetadataForParam(ValidClass, 2);

    expect(inject.getInjectMetadata).toHaveBeenCalledWith(ValidClass);
    expect(value).toBe('cool item');
  });

  it('should return undefined if there is no metadata for a parameter at index', () => {
    jest.spyOn(inject, 'getInjectMetadata').mockReturnValue(new Map([
      [0, 'item1']
    ]));

    class ValidClass {
      constructor(
        @inject.Inject('item1') item: string
      ) {}
    }

    const value = inject.getInjectMetadataForParam(ValidClass, 2);

    expect(inject.getInjectMetadata).toHaveBeenCalledWith(ValidClass);
    expect(value).toBeUndefined();
  });

  it('should return undefined if there is no metadata', () => {
    jest.spyOn(inject, 'getInjectMetadata').mockReturnValue(undefined);

    class ValidClass {
      constructor(
        @inject.Inject('item1') item: string
      ) {}
    }

    const value = inject.getInjectMetadataForParam(ValidClass, 2);

    expect(inject.getInjectMetadata).toHaveBeenCalledWith(ValidClass);
    expect(value).toBeUndefined();
  });
});
