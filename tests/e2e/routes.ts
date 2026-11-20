/** Every route on the site. Part 2 pages are already listed — no edits needed when they ship. */
export const BASE_ROUTES = ['/', '/grow', '/learn', '/practice', '/your-path', '/help', '/glossary', '/about'];
export const ROUTES = [...BASE_ROUTES, ...BASE_ROUTES.map((r) => (r === '/' ? '/es/' : `/es${r}`))];
