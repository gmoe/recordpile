'use client';
import { useActionState } from 'react';

import { register } from './actions';
import styles from './page.module.scss';

export default function Register() {
  const [loginState, handleLogIn, isLoggingIn] = useActionState(register, undefined);

  console.log('loginState', loginState);

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
      </form>
    </div>
  );
}
