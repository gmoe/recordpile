'use server';
import { redirect } from 'next/navigation';

import { auth } from '@/app/lib/auth';

// TODO: Validation
export const logIn = async (formState: unknown, formData: FormData) => {
  try {
    await auth.api.signInEmail({
      body: {
        email: (formData.get('email') as string),
        password: (formData.get('password') as string),
      }
    });

    redirect('/my-pile');
  } catch (error) {
    console.error(error);
    return { error };
  }
}
