# Frontend

The frontend is a React application bundled with Vite.

---

## Files

### `frontend/index.html`
The single HTML page that serves as the app shell. Vite injects the bundled JavaScript here. The `<div id="root">` is where React mounts.

### `frontend/vite.config.js`
Vite configuration with two key settings:
- **React plugin** — enables JSX transformation
- **Dev proxy** — proxies `/api` requests to `http://localhost:8000` so the frontend can call the FastAPI backend during development without CORS issues

### `frontend/src/main.jsx`
React entry point. Mounts the `<App />` component into `#root` inside `React.StrictMode`.

### `frontend/src/App.jsx`
Root component. Sets up `BrowserRouter` and defines top-level routes. Currently has a single `/` route rendering a placeholder `Home` component. New pages/routes are added here.

### `frontend/package.json`
Dependencies:
| Package | Purpose |
|---------|---------|
| `react` / `react-dom` | UI framework |
| `react-router-dom` | Client-side routing |
| `vite` | Dev server and bundler |
| `@vitejs/plugin-react` | JSX support in Vite |

---

## Development

```bash
cd frontend
npm install
npm run dev      # starts dev server at http://localhost:5173
npm run build    # outputs production bundle to frontend/dist/
```

API calls from the frontend should use `/api/...` paths (e.g. `/api/trips`), which Vite proxies to the backend in development.
