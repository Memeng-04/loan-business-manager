interface WhiteButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function WhiteButton({
  children,
  onClick,
  className = "",
}: WhiteButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`mt-10 inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-lg font-semibold text-main-blue transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-main-blue sm:mt-12 sm:px-10 sm:py-3.5 sm:text-xl ${className}`}
    >
      {children}
    </button>
  );
}
