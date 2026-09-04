/** Recherche workspace — comparaison insensible à la casse et aux accents. */
export function normalizeWorkspaceQuery(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function isWorkspaceSearchActive(query: string): boolean {
  return normalizeWorkspaceQuery(query).length > 0;
}

/**
 * Vrai si l'un des champs contient la requête. Une requête vide matche tout,
 * ce qui permet d'appliquer le filtre sans condition en amont.
 */
export function matchesWorkspaceSearch(
  query: string,
  fields: Array<string | number | null | undefined>,
): boolean {
  const normalizedQuery = normalizeWorkspaceQuery(query);
  if (!normalizedQuery) return true;

  return fields.some(
    (field) =>
      field != null && normalizeWorkspaceQuery(String(field)).includes(normalizedQuery),
  );
}
