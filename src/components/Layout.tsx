import type { FC, PropsWithChildren } from 'react';
import { Footer } from './Footer';
import { Header } from './Header';

export const Layout: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <Header />
      <main className="flex-1">
        <div className="max-w-(--breakpoint-lg) mx-auto px-6 py-8">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};
