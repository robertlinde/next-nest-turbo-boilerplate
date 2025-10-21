import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';

export default async function Home(): Promise<JSX.Element> {
  const t = await getTranslations('pages.home');

  return <h2>{t('title')}</h2>;
}
