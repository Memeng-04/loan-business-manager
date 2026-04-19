import { Loader2, AlertCircle } from "lucide-react";
import Button from "./Button";

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
  variant?: "loading" | "error" | "compact" | "inline" ;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
};

export default function LoadingState({
  message = "Loading...",
  fullScreen = false,
  variant = "loading",
  actionLabel,
  onAction,
  className = "",
}: LoadingStateProps) {
  const isError = variant === "error";
  const isCompact = variant === "compact";
  const isInline = variant === "inline";

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-100 flex flex-col items-center justify-center bg-white/80 backdrop-blur-md transition-all ${className}`}
      >
        <div className="flex flex-col items-center gap-4 text-center p-8 rounded-3xl border border-gray-100">
          {isError ? (
            <AlertCircle size={48} className="text-red-500 animate-bounce" />
          ) : (
            <div className="relative">
              <Loader2 size={48} className="text-main-blue animate-spin" />
            </div>
          )}
          <div className="space-y-2">
            <h3
              className={`text-lg font-bold tracking-tight ${isError ? "text-red-600" : "text-gray-900"}`}
            >
              {isError ? "Something went wrong" : "Just a moment"}
            </h3>
            <p className="text-sm font-medium text-gray-500 max-w-60">
              {message}
            </p>
          </div>
          {isError && actionLabel && onAction && (
            <Button variant="outline" size="md" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isCompact) {
    return (
      <div
        className={`flex items-center gap-3 height-100 p-3 rounded-2xl bg-gray-50/50 border border-gray-100/30 ${className}`}
      >
        <div className="relative flex items-center justify-center">
          <Loader2 size={16} className="text-main-blue animate-spin" />
        </div>
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {message}
        </span>
      </div>
    );
  }

  if (isInline) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Loader2 size={14} className="text-main-blue animate-spin" />
        <span className="text-sm font-medium text-gray-500">{message}</span>
      </div>
    );
  }


  return (
    <div
      className={`flex flex-col items-center justify-center py-16 text-center gap-6 ${className}`}
    >
      {isError ? (
        <div className="p-4 rounded-3xl bg-red-50/50 border border-red-100/50">
          <AlertCircle size={40} className="text-red-500" />
        </div>
      ) : (
        <div className="relative p-4">
          <Loader2
            size={48}
            className="text-main-blue animate-[spin_1.5s_linear_infinite]"
          />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-sm font-bold tracking-[0.2em] uppercase text-gray-400/80">
          {message}
        </p>
        {!isError && (
          <div className="w-12 h-1 bg-gray-200 mx-auto rounded-full mt-4"></div>
        )}
      </div>
      {isError && actionLabel && onAction && (
        <Button variant="outline" size="md" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
