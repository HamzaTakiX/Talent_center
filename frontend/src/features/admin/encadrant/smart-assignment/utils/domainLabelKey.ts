/** Maps backend domain keys (snake_case) to admin-copy camelCase keys. */
export const domainToLabelKey = (domain: string): string =>
  domain.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase());
