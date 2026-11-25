const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Loja de Contas';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand shadow-glow">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12l5 5 9-10" />
            </svg>
          </span>
          <span className="text-lg font-extrabold tracking-tight">{STORE_NAME}</span>
        </div>
        <p className="hidden text-sm text-zinc-400 sm:block">Pague no PIX e receba a conta na hora.</p>
      </div>
    </header>
  );
}
