'use server';
import { redirect } from 'next/navigation';
// import { dbSource } from '@/app/db';
import { auth } from '@/app/lib/auth';

// TODO: Validation
export const register = async (formState: unknown, formData: FormData) => {
  // await dbSource();

  try {
    await auth.api.signUpEmail({
      body: {
        name: (formData.get('name') as string),
        email: (formData.get('email') as string),
        password: (formData.get('password') as string),
      }
    });

    redirect('/login');
  } catch (error) {
    console.error(error);
    return error;
  }
}
