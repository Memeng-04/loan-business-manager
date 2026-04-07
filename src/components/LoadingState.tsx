type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export default function LoadingState({
  message = "Loading session...",
  fullScreen = true,
}: LoadingStateProps) {
  const containerClassName = fullScreen
    ? "grid min-h-svh w-full place-items-center bg-main-blue text-white"
    : "grid min-h-[80vh] w-full place-items-center text-slate-600";

  return (
    <div className={containerClassName}>
      <p className="text-base text-center">{message}</p>
    </div>
  );
}
