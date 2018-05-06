import { getInjectMetadataForParam} from './inject';
import { isTokenProvider, TokenProvider } from './types/token.provider';
import { Provider } from './provider';
import { isArray } from 'lodash';

// TODO: find a better name
export class InjectorItem {
  // A map where all registered services will be stored
  // services used only for documentation?
  protected services: Type<any>[] = [];
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
        return tokenProvider.getValue(this);
      }

      if (!this.services.includes(token)) {
        throw new TypeError(
          `[${index}] Unresolved parameter of type: ${token.constructor.name}`
        );
      }

      return this.resolve<any>(token);
    };
  }

  addServiceOrToken(provider: TokenProvider<any> | Type<any> | Provider<any>) {
    if (isTokenProvider(provider)) {
      this.addProvider(new Provider(provider));
    } else if (provider instanceof Provider) {
      this.addProvider(provider);
    } else {
      this.addService(provider);
    }
  }

  // store services within the injector
  addService(target: Type<any>) {
    this.services.push(target);
  }

  addToken(tokenProvider: TokenProvider<any>) {
    const provider = new Provider(tokenProvider);
    this.tokenProviders.set(provider.name, provider);
  }

  addProvider(provider: Provider<any>) {
    this.tokenProviders.set(provider.name, provider);
  }

  resolveDeps(token): Set<Type<any> | Provider<any>> {
    if (isArray(token) && token.length === 0) {
      return new Set([token]);
    }

    const provider = this.tokenProviders.get(token);

    let tokenItem = provider ? provider : token;
    let deps: (Type<any> | Provider<any>)[];

    if (provider) {
      deps = provider.getDeps();
    } else if (this.services.includes(token)) {
      deps = (Reflect.getMetadata('design:paramtypes', token) || [])
        .map(this.resolveInjectParameters(token))
    } else {
      throw new TypeError(`Unresolved token: ${token.name} of type ${token.constructor.name}`);
    }

    return deps.reduce(
      (prevArray, currDep) =>
        new Set([...prevArray, ...this.resolveDeps(currDep)]),
      new Set([tokenItem])
    );
  }
}

export const Injector = new InjectorItem();