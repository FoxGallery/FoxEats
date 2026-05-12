import { useEffect } from 'react';

export function useDebouncedEffect(
  effect: () => void | (() => void),
  deps: ReadonlyArray<unknown>,
  delayMs: number,
) {
  useEffect(() => {
    const handle = setTimeout(() => {
      effect();
    }, delayMs);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, delayMs]);
}
