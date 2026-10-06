import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

const RELOAD_FLAG_KEY = 'config-audit:chunk-reload';
const RELOAD_COOLDOWN_MS = 10_000;

/** Lazy page chunks disappear when a new version is deployed while the tab stays open. */
function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed/i.test(message);
}

/**
 * Reloads once to pick up the new build. The timestamp guard stops a reload
 * loop if the chunk is genuinely missing.
 */
export function reloadForNewVersion(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_FLAG_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_FLAG_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable - without a guard, do not risk a reload loop
    return false;
  }
  window.location.reload();
  return true;
}

function ErrorFallback() {
  const { t } = useI18n();
  return (
    <div role="alert" className="mx-auto flex min-h-[50vh] max-w-md flex-col items-center justify-center gap-4 px-6 text-center">
      <AlertTriangle className="h-10 w-10 text-medium" aria-hidden="true" />
      <h1 className="text-title3 font-semibold text-label">{t.errorBoundary.title}</h1>
      <p className="text-subhead text-label-2">{t.errorBoundary.body}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex min-h-11 items-center gap-2 rounded-full bg-tint px-5 text-subhead font-semibold text-on-tint hover:brightness-110"
      >
        <RotateCcw className="h-4 w-4" aria-hidden="true" />
        {t.errorBoundary.reload}
      </button>
    </div>
  );
}

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Changing this value (e.g. the route) clears a previous error. */
  resetKey?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    if (isChunkLoadError(error) && reloadForNewVersion()) return;
    console.error('Unhandled UI error', error, info.componentStack);
  }

  componentDidUpdate(previous: ErrorBoundaryProps): void {
    if (this.state.hasError && previous.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  render(): ReactNode {
    return this.state.hasError ? <ErrorFallback /> : this.props.children;
  }
}
