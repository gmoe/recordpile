'use client';
import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { register } from './actions';
import styles from './page.module.scss';

export default function Register() {
  const router = useRouter();
  const [loginState, handleLogIn, isLoggingIn] = useActionState(register, undefined);

  useEffect(() => {
    if (loginState?.success) {
      router.push('/login');
    }
  }, [loginState]);

  return (
    <div>
      <form className={styles.loginForm}>
        <fieldset>
          <label htmlFor="register-name">
            Display Name
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="register-email">
            Email Address
          </label>
          <input
            id="register-email"
            name="email"
            type="email"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="register-password">
            Password
          </label>
          <input
            id="register-password"
            name="password"
            type="password"
            required
          />
        </fieldset>
        <button
          type="submit"
          formAction={handleLogIn}
          disabled={isLoggingIn}
        >
          Register
        </button>
        {Boolean(loginState?.error) && (
          <div>
            Something wrong happened...
          </div>
        )}
      </form>
    </div>
  );
}
