import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AppShell } from './app-shell';

describe('Estructura de Backstage', () => {
  it('ofrece navegación a inicio, eventos y cuenta', () => {
    render(
      <AppShell>
        <main>Contenido de prueba</main>
      </AppShell>,
    );

    const navigation = screen.getByRole('navigation', {
      name: 'Navegación principal',
    });

    expect(
      within(navigation).getByRole('link', { name: 'Inicio' }),
    ).toHaveAttribute('href', '/');

    expect(
      within(navigation).getByRole('link', { name: 'Eventos' }),
    ).toHaveAttribute('href', '/events');

    expect(
      within(navigation).getByRole('link', { name: 'Tu cuenta' }),
    ).toHaveAttribute('href', '/account');
  });

  it('ofrece un enlace para saltar al contenido', () => {
    render(
      <AppShell>
        <main>Contenido de prueba</main>
      </AppShell>,
    );

    const link = screen.getByRole('link', { name: 'Saltar al contenido' });

    expect(link).toHaveAttribute('href', '#contenido');
    expect(document.getElementById('contenido')).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('conserva el contenido de la página dentro de la estructura', () => {
    render(
      <AppShell>
        <main>
          <h1>Producción del concierto</h1>
        </main>
      </AppShell>,
    );

    expect(
      screen.getByRole('heading', { name: 'Producción del concierto' }),
    ).toBeVisible();
  });
});
