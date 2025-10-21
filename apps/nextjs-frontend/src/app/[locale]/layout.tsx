import {type JSX} from 'react';
import type {Metadata} from 'next';
import {ConfirmDialog} from 'primereact/confirmdialog';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
// eslint-disable-next-line import-x/order
import './globals.css';
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.min.css';
import 'primereact/resources/themes/bootstrap4-light-blue/theme.css';
import {ReactQueryProvider} from '@/providers/react-query/react-query.provider';
import {ToastProvider} from '@/providers/toast/toast.provider';
import {Header} from '@/components/header/header.component.tsx';
import {Footer} from '@/components/footer/footer.component';
import {routing} from '@/i18n/routing.ts';
import {ZodErrorProvider} from '@/providers/zod-error/zod-error.provider';
import {LoadingAnimation} from '@/components/loading-animation/loading-animation.component';

export const metadata: Metadata = {
  title: 'Next.js Frontend',
  description: 'Frontend powered by Next.js',
};

export default async function Layout({
  children,
  params,
}: {
  readonly children: React.ReactNode;
  readonly params: Promise<{locale: string}>;
}): Promise<JSX.Element> {
  // Ensure that the incoming `locale` is valid
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider>
          <ZodErrorProvider>
            <ToastProvider>
              <ConfirmDialog />
              <ReactQueryProvider>
                <LoadingAnimation />
                <Header />
                <div className="mx-auto my-6 flex w-full max-w-7xl flex-col px-2 md:my-8 md:px-4 lg:my-12 min-h-screen">
                  {children}
                </div>
                <Footer />
              </ReactQueryProvider>
            </ToastProvider>
          </ZodErrorProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
