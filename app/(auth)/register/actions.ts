'use server';
import { auth } from '@/app/lib/auth';

// TODO: Validation
export const register = async (formState: any, formData: FormData) => {
  await auth.api.signUpEmail({
    body: {
      name: (formData.get('name') as string),
      email: (formData.get('email') as string),
      password: (formData.get('password') as string),
    }
  })
}
