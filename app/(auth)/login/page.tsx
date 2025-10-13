'use client';
import { useActionState } from 'react';

import { logIn } from './actions';
import styles from './page.module.scss';

export default function Login() {
  const [loginState, handleLogIn, isLoggingIn] = useActionState(logIn, undefined);

  return (
    <div>
      <form className={styles.loginForm}>
        <fieldset>
          <label htmlFor="login-email">
            Email Address
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            required
          />
        </fieldset>
        <fieldset>
          <label htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
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
          Login
        </button>
      </form>
      {Boolean(loginState?.error) && (
        <div>
          Something went wrong...
        </div>
      )}
    </div>
  );
}
