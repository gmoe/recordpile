'use server';
import { redirect } from 'next/navigation';

import { dbSource } from '@/app/db';
import { auth } from '@/app/lib/auth';

// TODO: Validation
export const logIn = async (formState: any, formData: FormData) => {
  await dbSource();

  await auth.api.signInEmail({
    body: {
      email: (formData.get('email') as string),
      password: (formData.get('password') as string),
    }
  });

  redirect('/my-pile');
}
