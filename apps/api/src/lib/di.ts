import {
  container,
  type InjectionToken,
  injectable,
  Lifecycle,
} from 'tsyringe';
import type { constructor as TsyringeConstructor } from 'tsyringe/dist/typings/types';

export interface RegisterServiceOptions {
  token?: InjectionToken<unknown>;
  lifecycle?: Lifecycle;
}

export function RegisterService(
  options?: RegisterServiceOptions,
): ClassDecorator {
  return (target) => {
    const effectiveLifecycle = options?.lifecycle ?? Lifecycle.Singleton;
    const effectiveToken =
      options?.token ?? (target as unknown as TsyringeConstructor<unknown>);

    const classConstructor = target as unknown as TsyringeConstructor<unknown>;

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
