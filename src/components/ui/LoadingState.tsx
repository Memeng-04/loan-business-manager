import { Loader2, AlertCircle } from "lucide-react";
import Button from "./Button";

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
  variant?: "loading" | "error" | "compact" | "inline" | "blueBackground";
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
  const isBlue = variant === "blueBackground";

  if (fullScreen) {
    return (
      <div
        className={`fixed inset-0 z-100 flex flex-col items-center justify-center backdrop-blur-md transition-all ${
          isBlue ? "bg-main-blue" : "bg-white/80"
        } ${className}`}
      >
        <div
          className={`flex flex-col items-center gap-4 text-center p-8 rounded-3xl border ${
            isBlue
              ? "border-main-blue text-white/80"
              : "border-gray-100 text-gray-900"
          }`}
        >
          {isError ? (
            <AlertCircle size={48} className="text-red-500 animate-bounce" />
          ) : (
            <div className="relative">
              <Loader2
                size={48}
                className={`animate-spin ${isBlue ? "text-white" : "text-main-blue"}`}
              />
            </div>
          )}
          <div className="space-y-4">
            <h3 className={`text-lg font-bold tracking-tight`}>
              {isError ? "Something went wrong" : ""}
            </h3>
            <p
              className={`text-sm font-bold tracking-[0.2em] uppercase ${
                isBlue ? "text-white/80" : "text-gray-700/80"
              }`}
            >
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
        className={`flex items-center gap-3 h-full p-3 rounded-2xl bg-gray-50/50 border border-gray-100/30 ${className}`}
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
      className={`flex flex-col items-center justify-center p-8 text-center gap-6 w-full flex-1 ${
        isBlue ? "bg-main-blue min-h-screen" : "min-h-[60vh]"
      } ${className}`}
    >
      {isError ? (
        <div className="p-4 rounded-3xl bg-red-50/50 border border-red-100/50">
          <AlertCircle size={40} className="text-red-500" />
        </div>
      ) : (
        <div className="relative p-4">
          <Loader2
            size={48}
            className={`animate-[spin_1.5s_linear_infinite] ${
              isBlue ? "text-white" : "text-main-blue"
            }`}
          />
        </div>
      )}
      <div className="space-y-4">
        <p
          className={`text-sm font-bold tracking-[0.2em] uppercase ${
            isBlue ? "text-white/80 " : "text-gray-700/80"
          }`}
        >
          {message}
        </p>
       
      </div>
      {isError && actionLabel && onAction && (
        <Button
          variant={isBlue ? "white" : "outline"}
          size="md"
          onClick={onAction}
          className="mt-2"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
