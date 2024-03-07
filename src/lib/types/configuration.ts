import { z } from 'zod';

export const Configuration = z.object({
	popupTime: z.coerce.number().int().finite().min(0)
});

export type Configuration = z.infer<typeof Configuration>;
