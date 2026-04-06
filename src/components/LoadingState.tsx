type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export default function LoadingState({
  message = "Loading session...",
  fullScreen = true,
}: LoadingStateProps) {
  const containerClassName = fullScreen
    ? "grid h-svh w-full place-items-center bg-main-blue text-white"
    : "grid w-full place-items-center py-8 text-slate-600";

  return (
    <div className={containerClassName}>
      <p className="text-base">{message}</p>
    </div>
  );
}
