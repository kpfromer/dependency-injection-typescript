import { Provider } from './provider';
import { Injector } from './injector';

describe('Provider', () => {
  it('should throw error if token is not type of TokenProvider', () => {
    const handler = () => {
      new Provider({
        provide: 'hello',
        iaminvalid: true
      });
    };

    expect(handler).toThrowError('Unknown token type!');
  });

  describe('getValue', () => {
    it('should get resolve value from ValueProvider', () => {
      const valueProvider = new Provider({
        provide: 'Token',
        useValue: 'Cool new Token!'
      });

      expect(valueProvider.getValue()).toBe('Cool new Token!');
    });

    it('should get value from ClassProvider', () => {
      class User {}
      class NewUser {}

      const mockUser = jest.fn();

      jest.spyOn(Injector, 'resolve').mockReturnValue(mockUser);

      const classProvider = new Provider({
        provide: NewUser,
        useClass: User
      });

      const value = classProvider.getValue();

      expect(Injector.resolve).toHaveBeenCalledWith(User);
      expect(value).toEqual(mockUser);
    });

    it('should return factory value from FactoryProvider', () => {
      class User {
        getName() {
          return 'kyle';
        }
      }

      jest.spyOn(Injector, 'resolveArray').mockReturnValue((token, index) => {
        if (token === 'Adj') {
          return 'cool';
        } else if (token === User) {
          return new User();
        }
      });

      const classProvider = new Provider({
        provide: 'Factory',
        useFactory: (adj: string, user: User) => `${user.getName()} is ${adj}`,
        deps: ['Adj', User]
      });

      const value = classProvider.getValue();

      expect(Injector.resolveArray).toHaveBeenCalled();
      expect(value).toEqual('kyle is cool');
    });

    it('should return factory value even if there are no deps', () => {
      const mockMapFunction = jest.fn();
      jest.spyOn(Injector, 'resolveArray').mockReturnValue(mockMapFunction);

      const classProvider = new Provider({
        provide: 'LameFactory',
        useFactory: () => 'hello, world!',
        deps: []
      });

      const value = classProvider.getValue();

      expect(mockMapFunction).not.toHaveBeenCalled();
      expect(value).toBe('hello, world!');
    });
  });
});
