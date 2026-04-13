import Button from "./Button";

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
  variant?: "loading" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

export default function LoadingState({
  message = "Loading session...",
  fullScreen = true,
  variant = "loading",
  actionLabel,
  onAction,
}: LoadingStateProps) {
  const isError = variant === "error";
  const containerClassName = isError
    ? fullScreen
      ? "grid min-h-svh w-full place-items-center text-rose-700"
      : "grid min-h-[80vh] w-full place-items-center px-6 py-8 text-rose-700"
    : fullScreen
      ? "grid min-h-svh w-full place-items-center bg-main-blue text-white"
      : "grid min-h-[80vh] w-full place-items-center text-slate-600";

  return (
    <div className={containerClassName}>
      <div className="grid justify-items-center gap-3 text-center">
        <p className="text-base">{message}</p>
        {isError && actionLabel && onAction ? (
          <Button
            variant="outline"
            size="md"
            className="mt-0!"
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
