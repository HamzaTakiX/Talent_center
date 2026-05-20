# QuickCV (Svelte) — intégré au frontend Talent Center

UI [QuickCV](https://github.com/siduck/quickcv) en **Svelte 5**, compilée dans le **même projet Vite** que React.

## Utilisation

```bash
cd frontend
npm install
npm run dev
```

Ouvrir **http://localhost:5173/cv-editor** — aucun second terminal, aucun port 5174.

## Structure

| Chemin | Rôle |
|--------|------|
| `src/lib/` | Composants Svelte (éditeur, templates, état) |
| `embed/QuickCvApp.svelte` | Point d’entrée monté depuis React |
| `embed/mountQuickCv.ts` | `mount` / `unmount` Svelte 5 |
| `uno.config.ts` | UnoCSS (utilitaires QuickCV) |

## Routes React

- `/cv-editor` — créateur principal (onboarding)
- `/cv`, `/cv/:id/edit`, `/cv/:id/finalize` — même UI QuickCV

Le dossier `package.json` / SvelteKit ici est **legacy** (référence locale uniquement) ; le build officiel passe par `frontend/vite.config.ts`.
