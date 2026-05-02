import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="text-sm font-medium text-[var(--fg)] hover:text-[var(--muted)]"
        >
          Главная
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
