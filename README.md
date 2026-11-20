# Where You Want to Be

A calm, free, non-commercial website that shows people a safe order of money steps: no sign-up, no tracking, nothing saved.

- **Spec and split:** [`context/`](context/README.md)
- **Using the shared components:** [`HANDOFF.md`](HANDOFF.md)
- **Design rules:** [`DESIGN.md`](DESIGN.md)

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # static output in dist/
npm run check && npm run test:unit && npm test
```

Static Astro site. Deploy `dist/` to Netlify (`netlify.toml`) or Vercel (`vercel.json`); both ship the strict CSP headers.
