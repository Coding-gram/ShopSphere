import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AdminLayout from './AdminLayout';

describe('AdminLayout', () => {
  it('allows the responsive content column to shrink below its table content width', () => {
    render(
      <MemoryRouter>
        <AdminLayout />
      </MemoryRouter>,
    );

    expect(screen.getByRole('main')).toHaveClass('min-w-0', 'overflow-x-hidden');
    expect(screen.getByRole('main').parentElement?.parentElement).toHaveClass('overflow-x-hidden');
  });
});
