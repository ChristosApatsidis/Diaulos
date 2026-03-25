// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-full flex flex-col items-center">
      <h1 className="text-9xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold bg-accent text-accent-foreground p-1 rounded-lg">
        Page Not Found🫤
      </h2>
      <Link
        href="/"
        className="mt-4 px-6 py-2 bg-accent text-white rounded-lg hover:opacity-90 transition-opacity"
      >
        Go Home
      </Link>
    </div>
  );
}
