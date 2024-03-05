import {z} from "zod";

export const EntityIdSchema = z.number().min(-2_147_483_648).max(2_147_483_647);
export type EntityId = z.infer<typeof EntityIdSchema>;