import {type useTranslations} from 'next-intl';
import {type z} from 'zod';

export const createZodErrorMap = (t: ReturnType<typeof useTranslations>): z.core.$ZodErrorMap => {
  // eslint-disable-next-line complexity
  const errorMap: z.core.$ZodErrorMap = (issue) => {
    switch (issue.code) {
      case 'invalid_type': {
        if (issue.received === 'undefined' || issue.received === 'null') {
          return t('required');
        }

        return t('invalid-type', {
          expected: String(issue.expected),
          received: String(issue.received),
        });
      }

      case 'invalid_format': {
        // Handles email, url, and other string validations in v4
        if (issue.format === 'email') {
          return t('invalid-email');
        }

        if (issue.format === 'url') {
          return t('invalid-url');
        }

        return t('invalid-format');
      }

      case 'too_small': {
        if (issue.type === 'string') {
          return t('too-small', {minimum: String(issue.minimum)});
        }

        if (issue.type === 'number') {
          return t('number-too-small', {minimum: Number(issue.minimum)});
        }

        return undefined;
      }

      case 'too_big': {
        if (issue.type === 'string') {
          return t('too-big', {maximum: String(issue.maximum)});
        }

        if (issue.type === 'number') {
          return t('number-too-big', {maximum: Number(issue.maximum)});
        }

        return undefined;
      }

      case 'invalid_value': {
        // Handles literal values, enums, etc. in v4
        return t('invalid-value');
      }

      case 'unrecognized_keys': {
        return t('unrecognized-keys', {
          keys: issue.keys.join(', '),
        });
      }

      case 'invalid_union': {
        return t('invalid-union');
      }

      case 'not_multiple_of': {
        return t('not-multiple-of', {
          multipleOf: Number(issue.multipleOf),
        });
      }

      case 'custom': {
        return issue.message ?? t('custom-error');
      }

      case 'invalid_key':
      case 'invalid_element': {
        return undefined;
      }
    }
  };

  return errorMap;
};
