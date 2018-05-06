import * as tokenProvider from './token.provider';
import {
  instanceOfClassProvider,
  instanceOfFactoryProvider,
  instanceOfValueProvider,
  isTokenProvider
} from './token.provider';

describe('instanceOfValueProvider', () => {
  it('should return true if object is a Value Provider', () => {
    const valueProvider = {
      useValue: 'hello'
    };
    
    expect(instanceOfValueProvider(valueProvider)).toBe(true);
  });
  
  it('should return false if object is not a Value Provider', () => {
    const notValueProvider = {};

    expect(instanceOfValueProvider(notValueProvider)).toBe(false);
  });
});

describe('instanceOfClassProvider', () => {
  it('should return true if object is a Class Provider', () => {
    const classProvider = {
      useClass: 'hello'
    };

    expect(instanceOfClassProvider(classProvider)).toBe(true);
  });

  it('should return false if object is not a Class Provider', () => {
    const notClassProvider = {};

    expect(instanceOfClassProvider(notClassProvider)).toBe(false);
  });
});

describe('instanceOfFactoryProvider', () => {
  it('should return true if object is a Factory Provider', () => {
    const factoryProvider = {
      useFactory: 'hello'
    };

    expect(instanceOfFactoryProvider(factoryProvider)).toBe(true);
  });

  it('should return false if object is not a Factory Provider', () => {
    const notFactoryProvider = {};

    expect(instanceOfFactoryProvider(notFactoryProvider)).toBe(false);
  });
});

describe('isTokenProvider', () => {
  it('should return true if object is a Value Provider', () => {
    jest.spyOn(tokenProvider, 'instanceOfValueProvider').mockReturnValue(true);
    jest.spyOn(tokenProvider, 'instanceOfClassProvider').mockReturnValue(false);
    jest.spyOn(tokenProvider, 'instanceOfFactoryProvider').mockReturnValue(false);

    const valueProvider = {
      useValue: 'Hello'
    };

    expect(isTokenProvider(valueProvider)).toBe(true);
  });

  it('should return true if object is a Class Provider', () => {
    jest.spyOn(tokenProvider, 'instanceOfClassProvider').mockReturnValue(true);
    jest.spyOn(tokenProvider, 'instanceOfValueProvider').mockReturnValue(false);
    jest.spyOn(tokenProvider, 'instanceOfFactoryProvider').mockReturnValue(false);

    const classProvider = {
      useClass: 'Hello'
    };

    expect(isTokenProvider(classProvider)).toBe(true);
  });

  it('should return true if object is a Factory Provider', () => {
    jest.spyOn(tokenProvider, 'instanceOfFactoryProvider').mockReturnValue(true);
    jest.spyOn(tokenProvider, 'instanceOfValueProvider').mockReturnValue(false);
    jest.spyOn(tokenProvider, 'instanceOfClassProvider').mockReturnValue(false);

    const factoryProvider = {
      useFactory: 'Hello'
    };

    expect(isTokenProvider(factoryProvider)).toBe(true);
  });

  it('should return false if object is not a Factory Provider or Class Provider or Value Provider', () => {
    jest.spyOn(tokenProvider, 'instanceOfFactoryProvider').mockReturnValue(false);
    jest.spyOn(tokenProvider, 'instanceOfValueProvider').mockReturnValue(false);
    jest.spyOn(tokenProvider, 'instanceOfClassProvider').mockReturnValue(false);

    const randomObject = {
      hello: 'world'
    };

    expect(isTokenProvider(randomObject)).toBe(false);
  });
});
