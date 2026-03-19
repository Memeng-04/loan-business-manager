import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
};

export default function PageShell({ children }: PageShellProps) {
  return (
    <main className="min-h-svh bg-main-blue text-white">
      <section className="mx-auto flex min-h-svh w-full max-w-7xl flex-col justify-center px-6 py-10 sm:px-10 lg:px-16">
        {children}
      </section>
    </main>
  );
}
