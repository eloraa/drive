import { type StateCreator } from 'zustand';

export const loggerMiddleware =
  <T extends object>(
    config: StateCreator<T>,
    shouldLog: boolean,
  ): StateCreator<T> =>
  (set, get, api) =>
    config(
      (args) => {
        if (shouldLog) {
          console.log('Previous state:', get());
        }
        set(args);
        if (shouldLog) {
          console.log('Next state:', get());
        }
      },
      get,
      api,
    );
