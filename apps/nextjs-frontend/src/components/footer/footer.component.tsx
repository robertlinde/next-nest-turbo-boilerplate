import Link from 'next/link';
import {type JSX, useMemo} from 'react';

type FooterItem = {
  label: string;
  href: string;
};

type FooterItemsGroup = {
  label: string;
  items: FooterItem[];
};

export function Footer(): JSX.Element {
  const footerItemsGroups: FooterItemsGroup[] = useMemo(
    () => [
      {
        label: 'Company',
        items: [
          {label: 'About Us', href: '/about'},
          {label: 'Contact', href: '/contact'},
        ],
      },
      {
        label: 'Support',
        items: [
          {label: 'Imprint', href: '/imprint'},
          {label: 'Privacy Policy', href: '/privacy'},
          {label: 'Terms of Service', href: '/terms'},
        ],
      },
    ],
    [],
  );

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
        <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} My Company. All rights reserved.</p>
      </div>
    </footer>
  );
}
