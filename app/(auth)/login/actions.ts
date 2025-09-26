'use server';
import { auth } from '@/app/lib/auth';

// TODO: Validation
export const logIn = async (formState: any, formData: FormData) => {
  await auth.api.signInEmail({
    body: {
      email: (formData.get('email') as string),
      password: (formData.get('password') as string),
    }
  })
}
