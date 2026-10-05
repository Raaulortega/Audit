import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layout/AppLayout';
import { HomePage } from './pages/HomePage';

// Each tool is split into its own chunk so the initial load stays small.
const ScannerPage = lazy(() => import('./pages/ScannerPage').then((m) => ({ default: m.ScannerPage })));
const HistoryPage = lazy(() => import('./pages/HistoryPage').then((m) => ({ default: m.HistoryPage })));
const SecretsPage = lazy(() => import('./pages/SecretsPage').then((m) => ({ default: m.SecretsPage })));
const JwtPage = lazy(() => import('./pages/JwtPage').then((m) => ({ default: m.JwtPage })));
const HeadersPage = lazy(() => import('./pages/HeadersPage').then((m) => ({ default: m.HeadersPage })));
const PasswordLabPage = lazy(() => import('./pages/PasswordLabPage').then((m) => ({ default: m.PasswordLabPage })));
const RulesPage = lazy(() => import('./pages/RulesPage').then((m) => ({ default: m.RulesPage })));

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="secrets" element={<SecretsPage />} />
        <Route path="jwt" element={<JwtPage />} />
        <Route path="headers" element={<HeadersPage />} />
        <Route path="passwords" element={<PasswordLabPage />} />
        <Route path="rules" element={<RulesPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
