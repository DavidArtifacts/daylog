import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsType } from '../lib/actions';
import PreferencesTab from './PreferencesTab';

const mocks = vi.hoisted(() => ({
  useActionState: vi.fn(),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useActionState: mocks.useActionState,
  };
});

vi.mock('../lib/actions', () => ({
  saveSettings: vi.fn(),
}));

const initialSettings: SettingsType = {
  mfa: false,
  allowReg: false,
  allowUnsplash: false,
  enableS3: false,
};

describe('PreferencesTab', () => {
  beforeEach(() => {
    mocks.useActionState.mockReturnValue([
      {
        data: {
          mfa: false,
          allowReg: false,
          allowUnsplash: false,
          enableS3: false,
        },
        errors: {},
        success: false,
      },
      vi.fn(),
      false,
    ]);
    cleanup();
  });

  it('renders correctly', async () => {
    render(<PreferencesTab initialSettings={initialSettings} />);

    expect(await screen.findByText('Security')).toBeInTheDocument();
    expect(await screen.findByText('Third party')).toBeInTheDocument();
    expect(await screen.findByText('Storage')).toBeInTheDocument();
  });

  it('toggles MFA checkbox', async () => {
    render(<PreferencesTab initialSettings={initialSettings} />);

    const mfaCheckbox = screen.getByRole('switch', {
      name: /Force users to configure 2FA Authentication/i,
    });

    fireEvent.click(mfaCheckbox);

    expect(mfaCheckbox).toBeChecked();
  });

  it('toggles Allow Registration checkbox', () => {
    render(<PreferencesTab initialSettings={initialSettings} />);

    const allowRegCheckbox = screen.getByRole('switch', {
      name: /Allow users to Sign Up/i,
    });

    fireEvent.click(allowRegCheckbox);

    expect(allowRegCheckbox).toBeChecked();
  });

  it('toggles Unsplash checkbox', () => {
    render(<PreferencesTab initialSettings={initialSettings} />);

    const unsplashCheckbox = screen.getByRole('switch', {
      name: /Allow Unsplash as a source for images/i,
    });

    fireEvent.click(unsplashCheckbox);

    expect(unsplashCheckbox).toBeChecked();
  });
  
  it('toggles S3 checkbox', () => {
    render(<PreferencesTab initialSettings={initialSettings} />);

    const s3Checkbox = screen.getByRole('switch', {
      name: /Enable S3 Storage/i,
    });

    fireEvent.click(s3Checkbox);

    expect(s3Checkbox).toBeChecked();
  });

  it('submits the form', async () => {
    render(<PreferencesTab initialSettings={initialSettings} />);

    const saveButton = await screen.findByText('Save Settings');
    fireEvent.click(saveButton);

    expect(mocks.useActionState).toHaveBeenCalled();
  });

  it('shows success message on save', async () => {
    mocks.useActionState.mockReturnValue([
      {
        data: {
          mfa: false,
          allowReg: false,
          allowUnsplash: false,
          enableS3: false,
        },
        success: true,
        message: 'Settings saved successfully.',
      },
      vi.fn(),
      false,
    ]);

    render(<PreferencesTab initialSettings={initialSettings} />);

    const saveButton = await screen.findByText('Save Settings');
    fireEvent.click(saveButton);

    expect(
      await screen.findByText('Settings saved successfully.')
    ).toBeInTheDocument();
  });
});
