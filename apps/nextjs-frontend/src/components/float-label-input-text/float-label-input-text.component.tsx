import {type JSX} from 'react';
import {FloatLabel} from 'primereact/floatlabel';
import {InputText, type InputTextProps} from 'primereact/inputtext';
import {type FloatLabelInputTextProps} from './types/float-label-input-text.props.type.ts';

export function FloatLabelInputText({label, className, ...inputTextProps}: FloatLabelInputTextProps): JSX.Element {
  const mergedClassName = `p-2 ring-2 ring-slate-200 focus:ring-2 focus:ring-slate-600 ${className ?? ''}`;

  return (
    <FloatLabel>
      <InputText id={label} {...(inputTextProps as InputTextProps)} className={mergedClassName} />
      <label htmlFor={label}>{label}</label>
    </FloatLabel>
  );
}
