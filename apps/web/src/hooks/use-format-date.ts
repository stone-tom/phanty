import { useMemo } from 'react';
import { createDateFormatter } from '@/lib/date-format';

type UseFormatDateConfig = {
  fallback?: string;
};

export function useFormatDate(config: UseFormatDateConfig = {}) {
  const locale =
    typeof navigator === 'undefined'
      ? undefined
      : (navigator.languages?.[0] ?? navigator.language);
  console.log('Using locale:', locale);
  return useMemo(
    () =>
      createDateFormatter({
        locale,
        fallback: config.fallback,
      }),
    [config.fallback, locale],
  );
}
