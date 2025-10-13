'use server';
import { auth } from '@/app/lib/auth';

// TODO: Validation
export const register = async (formState: unknown, formData: FormData): Promise<{
  success: boolean;
  error: Error | null;
}> => {
  if (process.env.DISABLE_ACCOUNT_REGISTRATION) {
    return { success: false, error: new Error('No fam') };
  };

  try {
    await auth.api.signUpEmail({
      body: {
        name: (formData.get('name') as string),
        email: (formData.get('email') as string),
        password: (formData.get('password') as string),
      }
    });

    return { success: true, error: null };
  } catch (error) {
    console.error(error);
    return { success: false, error: error as Error };
  }
}
