import {useTranslations} from 'next-intl';
import {z} from 'zod';

export const createZodErrorMap = (t: ReturnType<typeof useTranslations>) => {
  const errorMap: z.ZodErrorMap = (issue, ctx) => {
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.received === 'undefined' || issue.received === 'null') {
          return {message: t('required')};
        }
        return {
          message: t('invalid-type', {
            expected: issue.expected,
            received: issue.received,
          }),
        };

      case z.ZodIssueCode.invalid_string:
        if (issue.validation === 'email') {
          return {message: t('invalid-email')};
        }
        if (issue.validation === 'url') {
          return {message: t('invalid-url')};
        }
        return {message: t('invalid-string')};

      case z.ZodIssueCode.too_small:
        if (issue.type === 'string') {
          return {
            message: t('too-small', {minimum: String(issue.minimum)}),
          };
        }
        if (issue.type === 'number') {
          return {
            message: t('number-too-small', {minimum: Number(issue.minimum)}),
          };
        }
        break;

      case z.ZodIssueCode.too_big:
        if (issue.type === 'string') {
          return {
            message: t('too-big', {maximum: String(issue.maximum)}),
          };
        }
        if (issue.type === 'number') {
          return {
            message: t('number-too-big', {maximum: Number(issue.maximum)}),
          };
        }
        break;

      case z.ZodIssueCode.invalid_literal:
        return {message: t('invalid-literal', {expected: String(issue.expected)})};

      case z.ZodIssueCode.unrecognized_keys:
        return {
          message: t('unrecognized-keys', {
            keys: issue.keys.join(', '),
          }),
        };

      case z.ZodIssueCode.invalid_union:
        return {message: t('invalid-union')};

      case z.ZodIssueCode.invalid_enum_value:
        return {
          message: t('invalid-enum', {
            options: issue.options?.join(', '),
          }),
        };

      case z.ZodIssueCode.invalid_date:
        return {message: t('invalid-date')};

      case z.ZodIssueCode.custom:
        return {message: issue.message || t('custom-error')};
    }

    // Fallback to default error
    return {message: ctx.defaultError};
  };

  return errorMap;
};
