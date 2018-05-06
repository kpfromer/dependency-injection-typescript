import { Provider } from './provider';

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
    let mockInjector;

    beforeEach(() => {
      mockInjector = {
        resolve: jest.fn(),
        resolveArray: jest.fn()
      };
    });

    it('should get resolve value from ValueProvider', () => {
      const valueProvider = new Provider({
        provide: 'Token',
        useValue: 'Cool new Token!'
      });

      expect(valueProvider.getValue(mockInjector)).toBe('Cool new Token!');
    });

    it('should get value from ClassProvider', () => {
      class User {}
      class NewUser {}

      const mockUser = jest.fn();

      mockInjector.resolve.mockReturnValue(mockUser);

      const classProvider = new Provider({
        provide: NewUser,
        useClass: User
      });

      const value = classProvider.getValue(mockInjector);

      expect(mockInjector.resolve).toHaveBeenCalledWith(User);
      expect(value).toEqual(mockUser);
    });

    it('should return factory value from FactoryProvider', () => {
      class User {
        getName() {
          return 'kyle';
        }
      }

      mockInjector.resolveArray.mockReturnValue((token, index) => {
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

      const value = classProvider.getValue(mockInjector);

      expect(mockInjector.resolveArray).toHaveBeenCalled();
      expect(value).toEqual('kyle is cool');
    });

    it('should return factory value even if there are no deps', () => {
      const mockMapFunction = jest.fn();
      mockInjector.resolveArray.mockReturnValue(mockMapFunction);

      const classProvider = new Provider({
        provide: 'LameFactory',
        useFactory: () => 'hello, world!',
        deps: []
      });

      const value = classProvider.getValue(mockInjector);

      expect(mockMapFunction).not.toHaveBeenCalled();
      expect(value).toBe('hello, world!');
    });
  });
});
