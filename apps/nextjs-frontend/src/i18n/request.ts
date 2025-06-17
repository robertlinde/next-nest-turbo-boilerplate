import {getRequestConfig} from 'next-intl/server';
import {type AbstractIntlMessages, hasLocale} from 'next-intl';
import {routing} from './routing.ts';

export default getRequestConfig(async ({requestLocale}) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  const localeJson = (await import(`../../locales/${locale}.json`)) as {default: AbstractIntlMessages};

  return {
    locale,
    messages: localeJson.default,
  };
});
