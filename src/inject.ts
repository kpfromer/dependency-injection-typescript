export const InjectKey = Symbol('inject_key');

export const Inject = (token: string | any): ParameterDecorator => {
  return (
    target: Object,
    propertyKey: string | symbol,
    parameterIndex: number
  ) => {
    // Not the constructor!
    if (propertyKey !== undefined) {
      throw new Error(
        "Can't apply Inject decorator for anything but the constructor"
      );
    }
    // todo: extract map as type for InjectParameters
    const existingContainsNameParameters =
      (Reflect.getMetadata(InjectKey, target) as Map<number, string>) ||
      new Map<number, string>();
    existingContainsNameParameters.set(parameterIndex, token);
    Reflect.defineMetadata(InjectKey, existingContainsNameParameters, target);
  };
};
