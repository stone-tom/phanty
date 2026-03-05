import Elysia from 'elysia';
import { container, type InjectionToken } from 'tsyringe';

export const requestScope = new Elysia({ name: 'request-scope' }).derive(
  { as: 'global' },
  () => {
    const childContainer = container.createChildContainer();

    return {
      scope: {
        resolve: <T>(token: InjectionToken<T>) => childContainer.resolve(token),
      },
    };
  },
);

export function provide<T extends Record<string, InjectionToken<unknown>>>(
  serviceMap: T,
) {
  const plugin = new Elysia({ name: 'provide-services' });

  for (const [key, token] of Object.entries(serviceMap)) {
    const instance = container.resolve(token);
    plugin.decorate(key, instance);
  }

  return plugin;
}
