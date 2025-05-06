import {type JSX} from 'react';

import type {Metadata} from 'next';

import './globals.css';

import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {ConfirmDialog} from 'primereact/confirmdialog';

import {Header} from '@/components/Header/Header.component';
import {ReactQueryProvider} from '@/providers/ReactQueryProvider';
import {ToastProvider} from '@/providers/ToastProvider';
import {UserProvider} from '@/providers/UserProvider';

export const metadata: Metadata = {
  title: 'Next.js Frontend',
  description: 'Frontend powered by Next.js',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <ConfirmDialog />
          <UserProvider>
            <ReactQueryProvider>
              <Header />
              <div className="mx-auto my-6 flex w-full max-w-7xl flex-col px-2 md:my-8 md:px-4 lg:my-12">
                {children}
              </div>
            </ReactQueryProvider>
          </UserProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
