type LoadingStateProps = {
  message?: string;
};

export default function LoadingState({
  message = "Loading session...",
}: LoadingStateProps) {
  return (
    <main className="grid min-h-svh place-items-center bg-main-blue text-white">
      <p className="text-base">{message}</p>
    </main>
  );
}
