import {Suspense, type JSX} from 'react';
import {Card} from 'primereact/card';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <Suspense fallback={<div className="w-full max-w-2xl">Loading...</div>}>{children}</Suspense>
      </Card>
    </div>
  );
}
