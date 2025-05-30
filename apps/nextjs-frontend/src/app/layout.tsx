import {type JSX} from 'react';
import type {Metadata} from 'next';
import {ConfirmDialog} from 'primereact/confirmdialog';
// eslint-disable-next-line import-x/order
import './globals.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import {ReactQueryProvider} from '@/providers/react-query/react-query.provider';
import {ToastProvider} from '@/providers/toast/toast.provider';
import {UserProvider} from '@/providers/user/user.provider';
import {Header} from '@/components/header/header.component.tsx';

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
