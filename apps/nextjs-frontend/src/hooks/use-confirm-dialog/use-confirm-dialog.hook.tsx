import {confirmDialog, type ConfirmDialogOptions, type ConfirmDialogReturn} from 'primereact/confirmdialog';

export const useConfirmDialog = (): {confirmDialog: (props: Partial<ConfirmDialogOptions>) => ConfirmDialogReturn} => {
  const defaultOptions: ConfirmDialogOptions = {
    header: 'Confirm',
    message: 'Are you sure you want to proceed?',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Yes',
    rejectLabel: 'No',
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
