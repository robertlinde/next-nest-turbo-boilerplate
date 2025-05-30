import {type RefAttributes} from 'react';
import {type InputTextProps} from 'primereact/inputtext';

export type FloatLabelInputTextProps = InputTextProps &
  RefAttributes<HTMLInputElement> & {
    label: string;
  };
