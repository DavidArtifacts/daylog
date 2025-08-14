import type { PropsWithChildren } from 'react';
import { vi } from 'vitest';

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('@/components/NavHeader', () => ({
  default: vi.fn(() => <div>NavHeader</div>),
}));

vi.mock('@/components/NavMenu', () => ({
  default: vi.fn(() => <div>NavMenu</div>),
}));

vi.mock('@/components/Page', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

vi.mock('@/components/PageHeader', () => ({
  default: vi.fn(({ title, children }: PropsWithChildren<{ title: string }>) => (
    <div>
      {title}
      {children}
    </div>
  )),
}));

vi.mock('@/components/PageBody', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

vi.mock('@/components/PageContainer', () => ({
  default: vi.fn(({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  )),
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    Suspense: vi.fn(({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    )),
  };
});

vi.mock('@/components/PageFooter', () => ({
  default: vi.fn(() => <div>PageFooter</div>),
}));
