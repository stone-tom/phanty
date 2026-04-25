import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from 'react';

export function useSyncedSortableState<TSource, TLocalState>(
  source: TSource,
  createLocalState: (source: TSource) => TLocalState,
) {
  const createLocalStateEvent = useEffectEvent(createLocalState);
  const [localState, setLocalState] = useState<TLocalState>(() =>
    createLocalState(source),
  );
  const previousLocalStateRef = useRef(localState);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    if (isDraggingRef.current) {
      return;
    }

    setLocalState(createLocalStateEvent(source));
  }, [source]);

  const handleDragStart = useCallback(() => {
    isDraggingRef.current = true;
    previousLocalStateRef.current = structuredClone(localState);
  }, [localState]);

  const handleDragEnd = useCallback((canceled: boolean) => {
    isDraggingRef.current = false;

    if (canceled) {
      setLocalState(previousLocalStateRef.current);
      return false;
    }

    return true;
  }, []);

  return {
    localState,
    setLocalState,
    handleDragStart,
    handleDragEnd,
  };
}
