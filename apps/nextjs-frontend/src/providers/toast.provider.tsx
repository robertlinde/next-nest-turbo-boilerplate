'use client';

import {createContext, type JSX, type ReactNode, useCallback, useRef} from 'react';
import {Toast, type ToastMessage} from 'primereact/toast';

export type ShowToastFunction = (options: ToastMessage) => void;

const defaultToastLife = 3000;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ToastContext = createContext<ShowToastFunction>(() => {});

export function ToastProvider({children}: {readonly children: ReactNode}): JSX.Element {
  const toastRef = useRef<Toast>(null);

  const showToast: ShowToastFunction = useCallback((options: ToastMessage): void => {
    options.life ??= defaultToastLife;

    toastRef?.current?.show(options);
  }, []);

  return (
    <ToastContext value={showToast}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext>
  );
}
