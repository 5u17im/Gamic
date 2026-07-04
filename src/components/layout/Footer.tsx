import Link from "next/link";

const footerLinks = [
  {
    title: "Categorías",
    links: [
      { name: "Arcade", href: "/categories?cat=arcade" },
      { name: "Puzzle", href: "/categories?cat=puzzle" },
      { name: "Estrategia", href: "/categories?cat=estrategia" },
      { name: "Ver todas", href: "/categories" },
    ],
  },
  {
    title: "Gamic",
    links: [
      { name: "Inicio", href: "/" },
      { name: "Ranking", href: "/ranking" },
      { name: "Blog", href: "#" },
      { name: "Contacto", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Términos de uso", href: "#" },
      { name: "Privacidad", href: "#" },
      { name: "Contacto", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-primary">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs text-text-on-primary">
                M
              </span>
              Gamic
            </Link>
            <p className="mt-3 text-sm text-text-secondary">
              Plataforma de minijuegos originales. Juega, compite y diviértete.
            </p>
          </div>
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h4 className="mb-3 text-sm font-semibold text-text-primary">
                {group.title}
              </h4>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text-secondary transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} Gamic. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
