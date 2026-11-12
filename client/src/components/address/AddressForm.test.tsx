import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AddressForm } from './AddressForm';

describe('AddressForm', () => {
  it('blocks invalid delivery details before submitting', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<AddressForm onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText(/pincode/i));
    await user.type(screen.getByLabelText(/pincode/i), '123');
    await user.click(screen.getByRole('button', { name: /save address/i }));

    expect(await screen.findByText('Pincode must be 6 digits')).toBeInTheDocument();
    expect(screen.getByLabelText(/pincode/i)).toHaveAttribute('aria-invalid', 'true');
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
