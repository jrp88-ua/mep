import { z } from 'zod';
import * as m from '$paraglide/messages';
import { academicCentresStore } from '$lib/stores/models';

export const ModelId = z.number().min(-2_147_483_648).max(2_147_483_647);
export type ModelId = z.infer<typeof ModelId>;

export type Model = {
	id: ModelId;
};

///

export class Examinee implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Surenames = z.string().trim();
	static Origin = z.string().trim().min(1);
	static Court = z.coerce.number().finite().gte(-32768).lte(32767);
	static AcademicCentreId = ModelId.optional();
	static Type = z.object({
		id: Examinee.Id,
		name: Examinee.Name,
		surenames: Examinee.Surenames,
		origin: Examinee.Origin,
		court: Examinee.Court,
		academicCentreId: Examinee.AcademicCentreId.optional()
	});

	readonly id: ModelId;
	readonly name: string;
	readonly surenames: string;
	readonly origin: string;
	readonly court: number;
	readonly academicCentreId: number | undefined;

	lazyAcademicCentreName: undefined | string = undefined;

	constructor(params: {
		id: ModelId;
		name: string;
		surenames: string;
		origin: string;
		court: number;
		academicCentreId?: ModelId;
	}) {
		params = Examinee.Type.parse(params);
		this.id = params.id;
		this.name = params.name;
		this.surenames = params.surenames;
		this.origin = params.origin;
		this.court = params.court;
		this.academicCentreId = params.academicCentreId;
	}

	public async getAcademicCentre(): Promise<AcademicCentre | undefined> {
		if (this.academicCentreId === undefined) return Promise.resolve(undefined);
		const academicCentre = await academicCentresStore.getInstance(this.academicCentreId);
		this.lazyAcademicCentreName = academicCentre?.name;
		return academicCentre;
	}
}

export const ExamineeForCreate = z.object({
	name: Examinee.Name,
	surenames: Examinee.Surenames,
	origin: Examinee.Origin,
	court: Examinee.Court
});
export type ExamineeForCreate = z.infer<typeof ExamineeForCreate>;

export const ExamineeForUpdate = z.object({
	name: Examinee.Name.optional(),
	surenames: Examinee.Surenames.optional(),
	origin: Examinee.Origin.optional(),
	court: Examinee.Court.optional()
});
export type ExamineeForUpdate = z.infer<typeof ExamineeForUpdate>;

///

export class AcademicCentre implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Type = z.object({
		id: AcademicCentre.Id,
		name: AcademicCentre.Name
	});

	readonly id: ModelId;
	readonly name: string;

	constructor(params: { id: ModelId; name: string }) {
		params = AcademicCentre.Type.parse(params);
		this.id = params.id;
		this.name = params.name;
	}
}

export const AcademicCentreForCreate = z.object({
	name: AcademicCentre.Name
});
export type AcademicCentreForCreate = z.infer<typeof AcademicCentreForCreate>;

export const AcademicCentreForUpdate = z.object({
	name: AcademicCentre.Name.optional()
});
export type AcademicCentreForUpdate = z.infer<typeof AcademicCentreForUpdate>;

///

export function subjectKindValuesTranslate(kind: (typeof subjectKindValues)[number]) {
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

export class Subject {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Kind = z.enum(subjectKindValues).default('UNKNOWN');
	static Type = z.object({
		id: Subject.Id,
		name: Subject.Name,
		kind: Subject.Kind
	});

	readonly id: ModelId;
	readonly name: string;
	readonly kind: (typeof subjectKindValues)[number];

	constructor(params: { id: ModelId; name: string; kind?: (typeof subjectKindValues)[number] }) {
		params = Subject.Type.parse(params);
		this.id = params.id;
		this.name = params.name;
		this.kind = params.kind || 'UNKNOWN';
	}
}

export const SubjectForCreate = z.object({
	name: Subject.Name,
	kind: Subject.Kind
});
export type SubjectForCreate = z.infer<typeof SubjectForCreate>;

export const SubjectForUpdate = z.object({
	name: Subject.Name.optional(),
	kind: Subject.Kind.optional()
});
export type SubjectForUpdate = z.infer<typeof SubjectForUpdate>;

///
