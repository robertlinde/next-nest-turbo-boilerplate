import {confirmDialog, type ConfirmDialogOptions, type ConfirmDialogReturn} from 'primereact/confirmdialog';
import {useTranslations} from 'next-intl';

export const useConfirmDialog = (): {confirmDialog: (props: Partial<ConfirmDialogOptions>) => ConfirmDialogReturn} => {
  const t = useTranslations('Component-ConfirmDialog');

  const defaultOptions: ConfirmDialogOptions = {
    header: t('header'),
    message: t('message'),
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: t('acceptLabel'),
    rejectLabel: t('rejectLabel'),
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
