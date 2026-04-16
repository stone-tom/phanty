export type DateFormatInput = Date | number | string | null | undefined;
export type DateFormatVariant = 'date' | 'datetime';

type DateFormatterConfig = {
  locale?: string;
  fallback?: string;
};

const DEFAULT_FALLBACK = '-';

function getFormatterOptions(
  variant: DateFormatVariant,
): Intl.DateTimeFormatOptions {
  if (variant === 'date') {
    return {
      dateStyle: 'medium',
    };
  }

  return {
    dateStyle: 'medium',
    timeStyle: 'short',
  };
}

function toDate(value: DateFormatInput) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === 'string' && value.trim() === '') {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function createDateFormatter(config: DateFormatterConfig = {}) {
  const fallback = config.fallback ?? DEFAULT_FALLBACK;
  const formatterCache = new Map<DateFormatVariant, Intl.DateTimeFormat>();

  return (value: DateFormatInput, variant: DateFormatVariant = 'datetime') => {
    const date = toDate(value);
    if (!date) {
      return fallback;
    }

    let formatter = formatterCache.get(variant);
    if (!formatter) {
      formatter = new Intl.DateTimeFormat(
        config.locale,
        getFormatterOptions(variant),
      );
      formatterCache.set(variant, formatter);
    }

    return formatter.format(date);
  };
}
