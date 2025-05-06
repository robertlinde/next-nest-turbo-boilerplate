'use client';

import {useState, type JSX} from 'react';

import {LoginCredentials} from './components/LoginCredentials/LoginCredentials.component';
import {LoginTwoFactor} from './components/LoginTwoFactor/LoginTwoFactor.component';

export default function Login(): JSX.Element {
  const [tab, setTab] = useState<'credentials' | '2fa'>('credentials');

  return (
    <>
      {tab === 'credentials' ? (
        <LoginCredentials
          handleLoginCredentialsSuccess={() => {
            setTab('2fa');
          }}
        />
      ) : (
        <LoginTwoFactor />
      )}
    </>
  );
}
