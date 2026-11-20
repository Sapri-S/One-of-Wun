// Preview build for a static file host with no directory indexes (e.g. a claude.ai artifact).
// Produces flat .html files; scripts/preview-relativize.mjs then makes every path relative.
import base from './astro.config.mjs';
export default { ...base, outDir: './preview-dist', build: { ...base.build, format: 'file' }, integrations: [] };
