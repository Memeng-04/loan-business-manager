type HeaderProps = {
  title: string;
  subtitle?: string;
};

export default function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="bg-main-blue px-6 py-5 text-white sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-1">
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        {subtitle ? <p className="text-sm text-white/75">{subtitle}</p> : null}
      </div>
    </header>
  );
}
