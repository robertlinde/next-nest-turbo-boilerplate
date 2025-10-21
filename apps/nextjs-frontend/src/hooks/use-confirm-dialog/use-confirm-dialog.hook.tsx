'use client';

import {useTranslations} from 'next-intl';
import {confirmDialog, type ConfirmDialogOptions, type ConfirmDialogReturn} from 'primereact/confirmdialog';

export const useConfirmDialog = (): {confirmDialog: (props: Partial<ConfirmDialogOptions>) => ConfirmDialogReturn} => {
  const t = useTranslations('components.confirmDialog');

  const defaultOptions: ConfirmDialogOptions = {
    header: t('header'),
    message: t('message'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('buttons.accept'),
    rejectLabel: t('buttons.reject'),
    acceptClassName: 'p-button-success',
    rejectClassName: 'p-button-danger',
    defaultFocus: 'accept',
    element: undefined,
    props: {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    accept() {},
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    reject() {},
  };

  const confirmDialogWithDefaults = (props: Partial<ConfirmDialogOptions>): ConfirmDialogReturn => {
    const mergedProps = {...defaultOptions, ...props};
    return confirmDialog(mergedProps);
  };

  return {confirmDialog: confirmDialogWithDefaults};
};
