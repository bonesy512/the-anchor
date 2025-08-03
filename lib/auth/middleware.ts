import { z } from 'zod';
import { User } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export type ActionState = {
  error?: string;
  success?: string;
  [key: string]: any; // This allows for additional properties
};

type ValidatedActionFunction<S extends z.ZodType<any, any>, T> = (
  data: z.infer<S>,
  formData: FormData
) => Promise<T>;

// This function is still useful for validating form data in our server actions.
export function validatedAction<S extends z.ZodType<any, any>, T>(
  schema: S,
  action: ValidatedActionFunction<S, T>
) {
  return async (prevState: ActionState, formData: FormData) => {
    const result = schema.safeParse(Object.fromEntries(formData));
    if (!result.success) {
      // Return a more detailed error message if possible
      const errorMessage = result.error.errors[0]?.message || 'Invalid input.';
      return { error: errorMessage };
    }

    return action(result.data, formData);
  };
}

// NOTE: The 'validatedActionWithUser' and 'withTeam' functions have been removed
// as they were dependent on the old, complex SaaS schema.
// We can add a new, simplified user-aware action helper later if needed.
