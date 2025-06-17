'use client';

import {type JSX, useTransition} from 'react';
import {Dropdown, type DropdownChangeEvent} from 'primereact/dropdown';
import {type SelectItemOptionsType} from 'primereact/selectitem';
import {type Locale, useLocale, useTranslations} from 'next-intl';
import {useParams} from 'next/navigation';
import {usePathname, useRouter} from '@/i18n/navigation.ts';
import {routing} from '@/i18n/routing.ts';

export function LocaleSelect(): JSX.Element {
  const t = useTranslations('Component-Footer-LocaleSelect');

  const locale = useLocale();

  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();

  const router = useRouter();

  const params = useParams();

  const localeOptions: SelectItemOptionsType = routing.locales.map((locale) => ({
    label: t(locale),
    value: locale,
  }));

  const onLocaleChange = (event: DropdownChangeEvent): void => {
    const nextLocale = event.target.value as Locale;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- TypeScript will validate that only known `params`
        // are used in combination with a given `pathname`. Since the two will
        // always match for the current route, we can skip runtime checks.
        {pathname, params},
        {locale: nextLocale},
      );
    });
  };

  return (
    <Dropdown
      className="locale-select-dropdown"
      disabled={isPending}
      value={locale}
      options={localeOptions}
      dropdownIcon="pi pi-language"
      onChange={onLocaleChange}
    />
  );
}
