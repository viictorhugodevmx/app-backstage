import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Home from './page';

describe('Página inicial', () => {
  it('muestra un encabezado principal visible', () => {
    render(<Home />);

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: /to get started, edit/i,
      }),
    ).toBeVisible();
  });

  it('ofrece un enlace a la documentación de Next', () => {
    render(<Home />);

    const link = screen.getByRole('link', { name: 'Documentation' });
    const href = link.getAttribute('href');

    expect(href).toBeTruthy();

    const url = new URL(href!);

    expect(url.origin).toBe('https://nextjs.org');
    expect(url.pathname).toBe('/docs');
  });
});
