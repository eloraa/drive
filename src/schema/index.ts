import { z } from 'zod';

const signInSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email',
  }),
});

export { signInSchema };
