import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

export function ErrorBoundary({ children }: Props) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const isIgnoredError = (reasonStr: string): boolean => {
      const lower = (reasonStr || '').toLowerCase();
      return (
        lower.includes('websocket') ||
        lower.includes('vite') ||
        lower.includes('resizeobserver') ||
        lower.includes('networkerror') ||
        lower.includes('load failed') ||
        lower.includes('failed to fetch')
      );
    };

    const handleGlobalError = (event: ErrorEvent) => {
      const msg = event.message || event.error?.message || '';
      if (isIgnoredError(msg)) {
        return;
      }
      console.error('Captured Global Error in Boundary:', event.error);
      setError(event.error || new Error(event.message));
      setHasError(true);
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || String(event.reason || '');
      if (isIgnoredError(reason)) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      console.error('Captured Promise Rejection in Boundary:', event.reason);
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
      setHasError(true);
    };

    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  if (hasError) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6">
          <div className="size-20 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="size-10" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Ocorreu uma falha de exibição
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              O sistema recuperou um erro inesperado e evitou que a tela ficasse em branco.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-left overflow-auto max-h-32 text-[10px] font-mono text-slate-600 dark:text-slate-300">
              {error.toString()}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => {
                setHasError(false);
                setError(null);
                window.location.reload();
              }}
              className="flex-1 py-3.5 bg-primary text-white font-bold rounded-xl text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <RefreshCw className="size-4" />
              Recarregar App
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
