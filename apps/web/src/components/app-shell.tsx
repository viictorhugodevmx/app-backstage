import type { ReactNode } from 'react';
import Link from 'next/link';

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>

      <aside className="app-sidebar">
        <Link className="brand" href="/" aria-label="Backstage, inicio">
          <span className="brand-mark" aria-hidden="true">
            B/
          </span>
          <span className="brand-name">backstage</span>
        </Link>

        <div>
          <p className="nav-caption">Tu espacio</p>

          <nav className="app-nav" aria-label="Navegación principal">
            <Link href="/">
              <span className="nav-index" aria-hidden="true">
                01
              </span>
              Inicio
            </Link>
            <Link href="/events">
              <span className="nav-index" aria-hidden="true">
                02
              </span>
              Eventos
            </Link>
            <Link href="/account">
              <span className="nav-index" aria-hidden="true">
                03
              </span>
              Tu cuenta
            </Link>
          </nav>
        </div>

        <div className="sidebar-note">
          <strong>Todo empieza tras bambalinas.</strong>
          <p>Un espacio para preparar lo que sucede sobre el escenario.</p>
        </div>
      </aside>

      <div className="app-workspace">
        <header className="app-topbar">
          <p className="topbar-label">Producción de eventos</p>
          <Link className="topbar-link" href="/account">
            Mi cuenta
          </Link>
        </header>

        <div id="contenido" className="app-content" tabIndex={-1}>
          {children}
        </div>
      </div>
    </div>
  );
}
