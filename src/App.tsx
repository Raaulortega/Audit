import { lazy, type ComponentType } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';

// Each tool is split into its own chunk so the initial load stays small.
const pageLoaders: Record<string, () => Promise<{ default: ComponentType }>> = {
  scanner: () => import('./pages/ScannerPage').then((m) => ({ default: m.ScannerPage })),
  history: () => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })),
  secrets: () => import('./pages/SecretsPage').then((m) => ({ default: m.SecretsPage })),
  jwt: () => import('./pages/JwtPage').then((m) => ({ default: m.JwtPage })),
  headers: () => import('./pages/HeadersPage').then((m) => ({ default: m.HeadersPage })),
  passwords: () => import('./pages/PasswordLabPage').then((m) => ({ default: m.PasswordLabPage })),
  rules: () => import('./pages/RulesPage').then((m) => ({ default: m.RulesPage })),
};
const lazyPages = Object.entries(pageLoaders).map(([path, load]) => ({ path, Page: lazy(load) }));

function pageRoutes() {
  return (
    <>
      <Route index element={<HomePage />} />
      {lazyPages.map(({ path, Page }) => (
        <Route key={path} path={path} element={<Page />} />
      ))}
      <Route path="*" element={<NotFoundPage />} />
    </>
  );
}

/** English at the root, Spanish under /es — same pages, one crawlable URL per language. */
export function App() {
  return (
    <Routes>
      <Route path="/es" element={<AppLayout />}>
        {pageRoutes()}
      </Route>
      <Route path="/" element={<AppLayout />}>
        {pageRoutes()}
      </Route>
    </Routes>
  );
}
