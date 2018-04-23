import { getInjectMetadataForParam, InjectKey } from './inject';
import { TokenProvider } from './types/token.provider';
import { Provider } from './provider';

export const Injector = new class {
  // A map where all registered services will be stored
  // services used only for documentation?
  protected services = new Map<string, Type<any>>();
  protected tokenProviders = new Map<string | Type<any>, Provider<any>>();
  // protected classProviders = new Map<Type<any>, ClassProvider<any>>();
  // protected valueProviders = new Map<string, ValueProvider<any>>();
  // protected factoryProviders = new Map<string, FactoryProvider<any>>();

  // resolving instances
  resolve<T>(target: Type<any>): T {
    // tokens are required dependencies, while injections are resolved tokens from the Injector
    // injections recursively finds dependencies
    let tokens = Reflect.getMetadata('design:paramtypes', target) || [],
      injections = tokens
        .map(this.resolveInjectParameters(target))
        .map(this.resolveArray());

    return new target(...injections);
  }

  private resolveInjectParameters(
    target
  ): (token: any, index: number) => string | Type<any> {
    return (token, index) => {
      const tokenString = getInjectMetadataForParam(target, index);
      if (tokenString) {
        return tokenString;
      }
      return token;
    };
  }

  resolveArray() {
    return (token, index) => {
      // if (isString(token)) {
      //   return this.resolveStringToken(token);
      // }
      //
      // if (this.classProviders.get(token)) {
      //   return Injector.resolve<any>(this.classProviders.get(token).useClass);
      // }

      const tokenProvider = this.tokenProviders.get(token);

      if (tokenProvider) {
        return tokenProvider.getValue();
      }

      if (!this.services.get(token.name)) {
        throw new TypeError(
          `[${index}] Unresolved parameter of type: ${token.name}`
        );
      }

      return Injector.resolve<any>(token);
    };
  }

  // private resolveStringToken(tokenString) {
  //   if (this.valueProviders.get(tokenString)) {
  //     return this.valueProviders.get(tokenString).useValue;
  //   } else if (this.factoryProviders.get(tokenString)) {
  //     const deps = this.factoryProviders.get(tokenString).deps.map(this.resolveArray());
  //     return this.factoryProviders.get(tokenString).useFactory(...deps);
  //   } else {
  //     throw new Error(`No such token found: ${tokenString}`);
  //   }
  // }

  // store services within the injector
  addService(target: Type<any>) {
    this.services.set(target.name, target);
  }

  addToken(tokenProvider: TokenProvider<any>) {
    // if (instanceOfValueProvider(tokenProvider)) {
    //   this.valueProviders.set(tokenProvider.provide, tokenProvider);
    // } else if (instanceOfClassProvider(tokenProvider)) {
    //   this.classProviders.set(tokenProvider.provide, tokenProvider);
    // } else if (instanceOfFactoryProvider(tokenProvider)) {
    //
    //   if (!tokenProvider.deps) {
    //     tokenProvider.deps = [];
    //   }
    //
    //   this.factoryProviders.set(tokenProvider.provide, tokenProvider);
    // } else {
    //   throw new Error('Unknown token type!');
    // }
    const provider = new Provider(tokenProvider);
    this.tokenProviders.set(provider.name, provider);
  }
}();
