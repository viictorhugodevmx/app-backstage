import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AccountScreen } from './account-screen';

describe('Cuenta de Backstage', () => {
  it('ofrece iniciar sesión cuando no hay usuario', () => {
    render(<AccountScreen user={null} />);

    expect(
      screen.getByRole('link', { name: 'Iniciar sesión' }),
    ).toHaveAttribute('href', '/auth/login?returnTo=%2Faccount');

    expect(
      screen.queryByRole('link', { name: 'Cerrar sesión' }),
    ).not.toBeInTheDocument();
  });

  it('muestra al usuario autenticado y permite cerrar sesión', () => {
    render(
      <AccountScreen
        user={{ name: 'Productor de prueba', email: 'producer@example.com' }}
      />,
    );

    expect(
      screen.getByText('Sesión iniciada como Productor de prueba.'),
    ).toBeVisible();

    expect(screen.getByText('producer@example.com')).toBeVisible();

    expect(screen.getByRole('link', { name: 'Cerrar sesión' })).toHaveAttribute(
      'href',
      '/auth/logout',
    );

    expect(
      screen.queryByRole('link', { name: 'Iniciar sesión' }),
    ).not.toBeInTheDocument();
  });
});
