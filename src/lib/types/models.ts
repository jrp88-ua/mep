import { z } from 'zod';
import * as m from '$paraglide/messages';

export const ModelId = z.number().min(-2_147_483_648).max(2_147_483_647);
export type ModelId = z.infer<typeof ModelId>;

export type Model = {
	id: ModelId;
};

///

export const Examinee = z.object({
	id: ModelId,
	name: z.string().trim().min(1),
	surenames: z.string().trim(),
	origin: z.string().trim().min(1),
	court: z.coerce.number().finite().gte(-32768).lte(32767)
});
export type Examinee = z.infer<typeof Examinee>;

export const ExamineeForCreate = z.object({
	name: z.string().trim().min(1),
	surenames: z.string().trim(),
	origin: z.string().trim().min(1),
	court: z.coerce.number().finite().gte(-32768).lte(32767)
});
export type ExamineeForCreate = z.infer<typeof ExamineeForCreate>;

export const ExamineeForUpdate = z.object({
	name: z.string().trim().min(1).optional(),
	surenames: z.string().trim().optional(),
	origin: z.string().trim().min(1).optional(),
	court: z.coerce.number().finite().gte(-32768).lte(32767).optional()
});
export type ExamineeForUpdate = z.infer<typeof ExamineeForUpdate>;

///

export const AcademicCentre = z.object({
	id: ModelId,
	name: z.string().trim().min(1)
});
export type AcademicCentre = z.infer<typeof AcademicCentre>;

export const AcademicCentreForCreate = z.object({
	name: z.string().trim().min(1)
});
export type AcademicCentreForCreate = z.infer<typeof AcademicCentreForCreate>;

export const AcademicCentreForUpdate = z.object({
	name: z.string().trim().min(1).optional()
});
export type AcademicCentreForUpdate = z.infer<typeof AcademicCentreForUpdate>;

///

export function subjectKindValuesTranslate(kind: SubjectKind) {
	switch (kind) {
		case 'OBLIGATORY':
			return m.subject_kind_obligatory();
		case 'VOLUNTARY':
			return m.subject_kind_voluntary();
		case 'UNKNOWN':
			return m.subject_kind_unknown();
	}
}
export const subjectKindValues = ['OBLIGATORY', 'VOLUNTARY', 'UNKNOWN'] as const;
export const SubjectKind = z.enum(subjectKindValues).default('UNKNOWN');
export type SubjectKind = z.infer<typeof SubjectKind>;

export const Subject = z.object({
	id: ModelId,
	name: z.string().trim().min(1),
	kind: SubjectKind
});
export type Subject = z.infer<typeof Subject>;

export const SubjectForCreate = z.object({
	name: z.string().trim().min(1),
	kind: SubjectKind
});
export type SubjectForCreate = z.infer<typeof SubjectForCreate>;

export const SubjectForUpdate = z.object({
	name: z.string().trim().min(1).optional(),
	kind: SubjectKind.optional()
});
export type SubjectForUpdate = z.infer<typeof SubjectForUpdate>;

///
