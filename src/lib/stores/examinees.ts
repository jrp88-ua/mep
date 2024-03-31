import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';
import { academicCentresStore, type AcademicCentre } from './academicCentres';

export class Examinee implements Model {
	static Id = ModelId;
	static Nif = z.string().trim().min(1);
	static Name = z.string().trim().min(1);
	static Surenames = z.string().trim();
	static Origin = z.string().trim().min(1);
	static Court = z.coerce.number().finite().gte(-32768).lte(32767);
	static AcademicCentreId = ModelId.optional();
	static Type = z.object({
		id: Examinee.Id,
		nif: Examinee.Nif,
		name: Examinee.Name,
		surenames: Examinee.Surenames,
		origin: Examinee.Origin,
		court: Examinee.Court,
		academicCentreId: Examinee.AcademicCentreId.optional()
	});

	readonly id: ModelId;
	readonly nif: string;
	readonly name: string;
	readonly surenames: string;
	readonly origin: string;
	readonly court: number;
	readonly academicCentreId: number | undefined;

	lazyAcademicCentreName: undefined | string = undefined;

	constructor(params: {
		id: ModelId;
		nif: string;
		name: string;
		surenames: string;
		origin: string;
		court: number;
		academicCentreId?: ModelId;
	}) {
		params = Examinee.Type.parse(params);
		this.id = params.id;
		this.nif = params.nif;
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
	nif: Examinee.Nif,
	surenames: Examinee.Surenames,
	origin: Examinee.Origin,
	court: Examinee.Court
});
export type ExamineeForCreate = z.infer<typeof ExamineeForCreate>;

export const ExamineeForUpdate = z.object({
	name: Examinee.Name.optional(),
	nif: Examinee.Nif.optional(),
	surenames: Examinee.Surenames.optional(),
	origin: Examinee.Origin.optional(),
	court: Examinee.Court.optional()
});
export type ExamineeForUpdate = z.infer<typeof ExamineeForUpdate>;

export const examineesStore = createStore<Examinee, ExamineeForCreate, ExamineeForUpdate>(
	Examinee,
	'examinee',
	'examinees'
);
