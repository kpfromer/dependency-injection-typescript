import { getInjectMetadataForParam} from './inject';
import { TokenProvider } from './types/token.provider';
import { Provider } from './provider';

// TODO: find a better name
export class InjectorItem {
  // A map where all registered services will be stored
  // services used only for documentation?
  protected services = new Map<string, Type<any>>();
  protected tokenProviders = new Map<string | Type<any>, Provider<any>>();

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

  resolveInjectParameters(
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
      const tokenProvider = this.tokenProviders.get(token);

      if (tokenProvider) {
        return tokenProvider.getValue();
      }

      if (!this.services.get(token.name)) {
        throw new TypeError(
          `[${index}] Unresolved parameter of type: ${token.constructor.name}`
        );
      }

      return this.resolve<any>(token);
    };
  }

  // store services within the injector
  addService(target: Type<any>) {
    this.services.set(target.name, target);
  }

  addToken(tokenProvider: TokenProvider<any>) {
    const provider = new Provider(tokenProvider);
    this.tokenProviders.set(provider.name, provider);
  }
}

export const Injector = new InjectorItem();