import {getTranslations} from 'next-intl/server';
import {type JSX} from 'react';

export default async function Home(): Promise<JSX.Element> {
  const t = await getTranslations('Page-Home');

  return <h2>{t('title')}</h2>;
}
