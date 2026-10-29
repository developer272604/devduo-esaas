/** Longest search text the box accepts and the results page shows. */
export const MAX_QUERY = 80;

export const clampQuery = (q: string): string => q.slice(0, MAX_QUERY);

/** The query as shown in a heading: cut with an ellipsis when it is long. */
export const shortQuery = (q: string): string => (q.length > MAX_QUERY ? `${q.slice(0, MAX_QUERY)}…` : q);
