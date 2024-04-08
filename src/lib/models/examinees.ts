import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';
import { AcademicCentre, AcademicCentreForCreate } from './academicCentres';
import { get } from 'svelte/store';
import { getAcademicCentre } from '$lib/services/academicCentres';

export class Examinee implements Model {
	static Id = ModelId;
	static Nif = z.string().trim().min(1);
	static Name = z.string().trim().min(1);
	static Surenames = z.string().trim();
	static Origin = z.string().trim().min(1);
	static Court = z.coerce.number().finite().gte(-32768).lte(32767);
	static AcademicCentreId = AcademicCentre.Id;
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
	nif: string;
	name: string;
	surenames: string;
	origin: string;
	court: number;
	academicCentreId: number | undefined;

	lazyAcademicCentreName: undefined | string = undefined;

	constructor(params: {
		id: ModelId;
		nif: string;
		name: string;
		surenames: string;
		origin: string;
		court: number;
		academicCentre?: ModelId;
	}) {
		this.id = params.id;
		this.nif = params.nif;
		this.name = params.name;
		this.surenames = params.surenames;
		this.origin = params.origin;
		this.court = params.court;
		this.academicCentreId = params.academicCentre;
	}

	setNif(value: string): void {
		this.nif = Examinee.Nif.parse(value);
	}

	setName(value: string): void {
		this.name = Examinee.Name.parse(value);
	}

	setSurenames(value: string): void {
		this.surenames = Examinee.Surenames.parse(value);
	}

	setOrigin(value: string): void {
		this.origin = Examinee.Origin.parse(value);
	}

	setCourt(value: number): void {
		this.court = Examinee.Court.parse(value);
	}

	setAcademicCentreId(value: number | undefined): void {
		if (value !== undefined) {
			this.academicCentreId = ModelId.parse(value);
		} else {
			this.academicCentreId = undefined;
		}
		this.getAcademicCentre();
	}

	public getAcademicCentre(): AcademicCentre | undefined {
		if (this.academicCentreId === undefined) return undefined;
		const academicCentre = get(getAcademicCentre(this.academicCentreId));
		this.lazyAcademicCentreName = academicCentre?.name;
		return academicCentre;
	}

	toString(): string {
		return `id: ${this.id}, nif: ${this.nif}, name: ${this.name}, surenames: ${this.surenames}, origin: ${this.origin}, court: ${this.court}, academicCentreId: ${this.academicCentreId}, lazyAcademicCentreName: ${this.lazyAcademicCentreName}`;
	}
}

export const ExamineeForCreate = z.object({
	nif: Examinee.Nif,
	name: Examinee.Name,
	surenames: Examinee.Surenames,
	origin: Examinee.Origin,
	court: Examinee.Court,
	academicCentre: z.union([AcademicCentre.Id, AcademicCentreForCreate, z.string()]).optional()
});
export type ExamineeForCreate = z.infer<typeof ExamineeForCreate>;

export const examineesStore = createStore<Examinee>('examinee');
