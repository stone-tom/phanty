import { useCallback, useState } from 'react';

type Enable = () => void;
type Disable = () => void;
type Toggle = () => void;

export const useBooleanState = (initialState = false) => {
  const [isEnabled, setState] = useState(initialState);

  const enable: Enable = useCallback(() => {
    setState(true);
  }, []);

  const disable: Disable = useCallback(() => {
    setState(false);
  }, []);

  const toggle: Toggle = useCallback(() => {
    setState((currentState) => !currentState);
  }, []);

  return [isEnabled, enable, disable, toggle] as const;
};
