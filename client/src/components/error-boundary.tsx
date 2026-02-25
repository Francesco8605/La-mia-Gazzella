import React from "react";
import { queryClient } from "@/lib/queryClient";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  domErrorCount: number;
}

function isDomExtensionError(error: Error): boolean {
  const msg = error?.message || "";
  return (
    msg.includes("insertBefore") ||
    msg.includes("removeChild") ||
    msg.includes("NotFoundError") ||
    msg.includes("is not a child of this node") ||
    (error?.name === "NotFoundError")
  );
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  private recoveryTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, domErrorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    if (isDomExtensionError(error)) {
      return { hasError: true, error };
    }
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const isDomError = isDomExtensionError(error);

    try {
      fetch("/api/client-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          message: error?.message || "Unknown error",
          stack: error?.stack || "",
          componentStack: errorInfo?.componentStack || "",
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString(),
          isDomExtensionError: isDomError,
        }),
      }).catch(() => {});
    } catch (e) {}

    if (isDomError) {
      const newCount = this.state.domErrorCount + 1;
      this.setState({ domErrorCount: newCount });

      if (newCount <= 2) {
        if (this.recoveryTimer) clearTimeout(this.recoveryTimer);
        this.recoveryTimer = setTimeout(() => {
          this.setState({ hasError: false, error: null });
        }, 150);
        return;
      }
    }

    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  componentWillUnmount() {
    if (this.recoveryTimer) clearTimeout(this.recoveryTimer);
  }

  handleReset = () => {
    try {
      queryClient.clear();
    } catch (e) {}
    try {
      sessionStorage.clear();
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !key.startsWith("pwa-")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {}
    this.setState({ hasError: false, error: null, domErrorCount: 0 });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (isDomExtensionError(this.state.error!) && this.state.domErrorCount <= 2) {
        return null;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-slate-800 mb-3">
              Qualcosa è andato storto
            </h1>
            <p className="text-slate-600 mb-6">
              Si è verificato un errore imprevisto. Prova a ricaricare la pagina.
            </p>
            <button
              onClick={this.handleReset}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Torna alla Home
            </button>
            <button
              onClick={() => window.location.reload()}
              className="block mx-auto mt-3 text-slate-500 hover:text-slate-700 text-sm underline"
            >
              Ricarica la pagina
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
