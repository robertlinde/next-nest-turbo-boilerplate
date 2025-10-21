'use server';

import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';
import {LocaleSelect} from './components/LocaleSelect/locale-select.component';
import {Link} from '@/i18n/navigation.ts';

type FooterItem = {
  label: string;
  href: string;
};

type FooterItemsGroup = {
  label: string;
  items: FooterItem[];
};

export async function Footer(): Promise<JSX.Element> {
  const t = await getTranslations('components.footer');

  const footerItemsGroups: FooterItemsGroup[] = [
    {
      label: t('groups.company'),
      items: [
        {label: t('links.aboutUs'), href: '/about'},
        {label: t('links.contact'), href: '/contact'},
      ],
    },
    {
      label: t('groups.legal'),
      items: [
        {label: t('links.imprint'), href: '/imprint'},
        {label: t('links.privacyPolicy'), href: '/privacy'},
        {label: t('links.termsOfService'), href: '/terms'},
      ],
    },
  ];

  return (
    <footer className="px-2 md:px-4 py-4 bg-gray-200 text-gray-700 max-w-full">
      <div className="mx-auto max-w-7xl text-center divide-y-1 divide-gray-300">
        <nav className="mb-4 pb-4">
          <ul className="flex flex-wrap justify-center gap-8 md:gap-12 lg:gap-16">
            {footerItemsGroups.map((group) => (
              <li key={group.label} className="mb-2 text-sm">
                <p className="tracking-widest text-gray-400 mb-1">{group.label}</p>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-gray-600 hover:text-gray-800 transition-colors duration-200"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex flex-col items-center gap-4 w-full">
          <div className="flex justify-end w-full">
            <LocaleSelect />
          </div>
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} {t('copyrightNotice')}
          </p>
        </div>
      </div>
    </footer>
  );
}
