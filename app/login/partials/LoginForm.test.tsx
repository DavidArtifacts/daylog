import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import LoginForm from './LoginForm';

const state: {
  message: string;
  success: boolean;
  errors: { email?: string[]; password?: string[] };
} = {
  message: 'Error login to account',
  success: false,
  errors: { email: [], password: [] },
};

const mocks = vi.hoisted(() => ({
  useActionState: vi.fn(() => [state, vi.fn(), false]),
}));

vi.mock('../lib/actions', () => ({
  signin: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: mocks.useActionState,
  };
});

describe('LoginForm', () => {
  let mockState: {
    message: string;
    success: boolean;
    errors: { email?: string[]; password?: string[] };
  };
  beforeEach(() => {
    mockState = state;
    cleanup();
  });

  it('renders the login form', () => {
    render(<LoginForm allowReg={true} />);
    expect(screen.getByText('Login to your account')).toBeInTheDocument();
  });

  it('displays an error message when state.message is present', () => {
    mockState.message = 'Invalid credentials';
    mocks.useActionState.mockReturnValue([mockState, vi.fn(), false]);
    render(<LoginForm allowReg={true} />);
    expect(screen.getByText('Could not login')).toBeInTheDocument();
    expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
  });

  it('displays email validation errors', () => {
    mockState.errors = { email: ['Email is required'] };
    mocks.useActionState.mockReturnValue([mockState, vi.fn(), false]);
    render(<LoginForm allowReg={true} />);
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('displays password validation errors', () => {
    mockState.errors = { password: ['Password is required'] };
    mocks.useActionState.mockReturnValue([mockState, vi.fn(), false]);
    render(<LoginForm allowReg={true} />);
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('disables the submit button when pending is true', () => {
    mocks.useActionState.mockReturnValue([mockState, vi.fn(), true]);
    render(<LoginForm allowReg={true} />);
    expect(screen.getByRole('button', { name: /sign in/i })).toBeDisabled();
  });

  it('renders the registration link when allowReg is true', () => {
    render(<LoginForm allowReg={true} />);
    expect(screen.getByText("Don't have account yet?")).toBeInTheDocument();
    expect(screen.getByText('Sign up')).toBeInTheDocument();
  });

  it('does not render the registration link when allowReg is false', () => {
    render(<LoginForm allowReg={false} />);
    expect(
      screen.queryByText("Don't have account yet?")
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Sign up')).not.toBeInTheDocument();
  });

  it('removes modal backdrop on mount', () => {
    document.body.innerHTML = '<div class="modal-backdrop"></div>';
    render(<LoginForm allowReg={true} />);
    expect(document.getElementsByClassName('modal-backdrop').length).toBe(0);
  });

  it('submits the form with email and password', () => {
    const mockAction = vi.fn();
    mocks.useActionState.mockReturnValue([mockState, mockAction, false]);
    render(<LoginForm allowReg={true} />);
    fireEvent.change(screen.getByPlaceholderText('your@email.com'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Your password'), {
      target: { value: 'password' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    expect(mockAction).toHaveBeenCalled();
  });
});
