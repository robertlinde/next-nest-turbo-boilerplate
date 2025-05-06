'use client';

import {createContext, type JSX, type ReactNode, useRef} from 'react';

import {Toast, type ToastMessage} from 'primereact/toast';

export type ShowToastFunction = (options: ToastMessage) => void;

const defaultToastLife = 3000;

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const ToastContext = createContext<ShowToastFunction>(() => {});

export const ToastProvider = ({children}: {children: ReactNode}): JSX.Element => {
  const toastRef = useRef<Toast>(null);

  const showToast: ShowToastFunction = (options: ToastMessage): void => {
    options.life ||= defaultToastLife;

    toastRef?.current?.show(options);
  };

  return (
    <ToastContext value={showToast}>
      <Toast ref={toastRef} />
      {children}
    </ToastContext>
  );
};
