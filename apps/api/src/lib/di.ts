import {
  container,
  type InjectionToken,
  injectable,
  Lifecycle,
} from 'tsyringe';

export interface RegisterServiceOptions {
  token?: InjectionToken<unknown>;
  lifecycle?: Lifecycle;
}

// Define a proper constructor type instead of using the banned Function type
type Constructor = abstract new (...args: unknown[]) => unknown;

export function RegisterService(
  options?: RegisterServiceOptions,
): ClassDecorator {
  return (target) => {
    const effectiveLifecycle = options?.lifecycle ?? Lifecycle.Singleton;
    const effectiveToken = options?.token ?? (target as Constructor);

    const classConstructor = target as Constructor;

    container.register(
      effectiveToken,
      { useClass: classConstructor },
      { lifecycle: effectiveLifecycle },
    );

    try {
      injectable()(classConstructor);
    } catch (e) {
      console.warn(
        `Could not apply @injectable effect within custom decorator for ${target.name}`,
        e,
      );
    }
  };
}

export type ServiceInjectionMap = { [key: string]: InjectionToken<unknown> };
