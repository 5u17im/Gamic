"use client";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl font-bold text-danger/30 font-heading">!</span>
      <h1 className="mt-4 text-2xl font-semibold text-text-primary font-heading">
        Algo sali&oacute; mal
      </h1>
      <p className="mt-2 text-text-secondary">
        Ocurri&oacute; un error inesperado. Intenta de nuevo.
      </p>
      <button
        onClick={reset}
        className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
      >
        Reintentar
      </button>
    </div>
  );
}
