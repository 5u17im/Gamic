export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <span className="text-6xl font-bold text-primary/30 font-heading">404</span>
      <h1 className="mt-4 text-2xl font-semibold text-text-primary font-heading">
        P&aacute;gina no encontrada
      </h1>
      <p className="mt-2 text-text-secondary">
        El juego que buscas no existe o ha sido movido.
      </p>
      <a
        href="/"
        className="mt-6 inline-flex h-12 items-center rounded-lg bg-primary px-6 text-sm font-medium text-text-on-primary transition-colors hover:bg-primary-hover"
      >
        Volver al inicio
      </a>
    </div>
  );
}
