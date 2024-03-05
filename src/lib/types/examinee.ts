import {z} from "zod";
import { EntityIdSchema } from "./general";

export const ExamineeOrigin = z.union([
    z.literal('Baccalaureate'),
    z.literal('VocationalTraining'),
    z.object({
        Other: z.string().trim().min(1),
    }),
]);
export type ExamineeOrigin = z.infer<typeof ExamineeOrigin>;

export const Examinee = z.object({
    id: EntityIdSchema,
    name: z.string().trim().min(1),
    surenames: z.string().trim(),
    origin: z.enum(["Baccalaureate", "VocationalTraining"]),
    court: z.coerce.number().finite().gte(-32768).lte(32767),
});
export type Examinee = z.infer<typeof Examinee>;

export const ExamineeForCreate = z.object({
    name: z.string().trim().min(1),
    surenames: z.string().trim(),
    origin: z.enum(["Baccalaureate", "VocationalTraining"]),
    court: z.coerce.number().finite().gte(-32768).lte(32767),
});
export type ExamineeForCreate = z.infer<typeof ExamineeForCreate>;

export const ExamineeForUpdate = z.object({
    name: z.string().trim().min(1).optional(),
    surenames: z.string().trim().optional(),
    origin: z.enum(["Baccalaureate", "VocationalTraining"]).optional(),
    court: z.coerce.number().finite().gte(-32768).lte(32767).optional(),
});
export type ExamineeForUpdate = z.infer<typeof ExamineeForUpdate>;