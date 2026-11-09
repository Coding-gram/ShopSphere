import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext, type AuthContextValue } from '@/hooks/useAuth';
import Login from './Login';

// Mock sonner
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithAuth(
  ui: React.ReactElement,
  authOverrides: Partial<AuthContextValue> = {}
) {
  const authValue: AuthContextValue = {
    user: null,
    isLoading: false,
    isAuthenticated: false,
    isAdmin: false,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    updateProfile: vi.fn(),
    ...authOverrides,
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>{ui}</MemoryRouter>
    </AuthContext.Provider>
  );
}

describe('Login page', () => {
  it('renders login form with email and password fields', () => {
    renderWithAuth(<Login />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    renderWithAuth(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows email validation error for invalid email', async () => {
    const user = userEvent.setup();
    renderWithAuth(<Login />);

    await user.type(screen.getByLabelText('Email'), 'notanemail');
    await user.type(screen.getByLabelText('Password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email')).toBeInTheDocument();
    });
  });

  it('calls login on valid submission', async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderWithAuth(<Login />, { login: mockLogin });

    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    renderWithAuth(<Login />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByLabelText('Show password'));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByLabelText('Hide password'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('has link to register page', () => {
    renderWithAuth(<Login />);
    const link = screen.getByText('Create one');
    expect(link.closest('a')).toHaveAttribute('href', '/register');
  });
});

