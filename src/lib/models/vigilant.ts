import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';
import { Subject } from './subjects';
import { AcademicCentre } from './academicCentres';
import { getAcademicCentre } from '$lib/services/academicCentres';
import { get } from 'svelte/store';
import { getSubject } from '$lib/services/subjects';

export const VIGILANT_ROLE_VALUES = ['PRESIDENT', 'SECRETARY', 'MEMBER'] as const;

export class Vigilant implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Surenames = z.string().trim();
	static Role = z.enum(VIGILANT_ROLE_VALUES).default('MEMBER');
	static SpecialtyId = Subject.Id.optional();
	static AcademicCentreId = AcademicCentre.Id.optional();
	static MainCourt = z.coerce.number().finite().gte(-32768).lte(32767);
	static Type = z.object({
		id: Vigilant.Id,
		name: Vigilant.Name,
		surenames: Vigilant.Surenames,
		role: Vigilant.Role,
		specialtyId: Vigilant.SpecialtyId,
		academicCentreId: Vigilant.AcademicCentreId,
		mainCourt: Vigilant.MainCourt
	});

	readonly id: ModelId;
	name: string;
	surenames: string;
	role: (typeof VIGILANT_ROLE_VALUES)[number];
	specialtyId: number | undefined;
	academicCentreId: number | undefined;
	mainCourt: number;

	lazyAcademicCentreName: undefined | string = undefined;
	lazySpecialtyName: undefined | string = undefined;

	constructor(params: {
		id: ModelId;
		name: string;
		surenames: string;
		role: (typeof VIGILANT_ROLE_VALUES)[number];
		specialtyId?: number;
		academicCentreId?: number;
		mainCourt: number;
	}) {
		this.id = params.id;
		this.name = params.name;
		this.surenames = params.surenames;
		this.role = params.role;
		this.specialtyId = params.specialtyId;
		this.academicCentreId = params.academicCentreId;
		this.mainCourt = params.mainCourt;
	}

	setName(value: string): void {
		this.name = Vigilant.Name.parse(value);
	}

	setSurenames(value: string): void {
		this.surenames = Vigilant.Surenames.parse(value);
	}

	setRole(value: (typeof VIGILANT_ROLE_VALUES)[number]): void {
		this.role = Vigilant.Role.parse(value);
	}

	setSpecialtyId(value: number | undefined): void {
		if (value !== undefined) {
			this.specialtyId = Subject.Id.parse(value);
			this.getSpecialty();
		} else {
			this.specialtyId = undefined;
			this.lazySpecialtyName = undefined;
		}
	}

	setAcademicCentreId(value: number | undefined): void {
		if (value !== undefined) {
			this.academicCentreId = AcademicCentre.Id.parse(value);
			this.getAcademicCentre();
		} else {
			this.academicCentreId = undefined;
			this.lazyAcademicCentreName = undefined;
		}
	}

	setMainCourt(value: number): void {
		this.mainCourt = Vigilant.MainCourt.parse(value);
	}

	public getAcademicCentre(): AcademicCentre | undefined {
		if (this.academicCentreId === undefined) return undefined;
		const academicCentre = get(getAcademicCentre(this.academicCentreId));
		this.lazyAcademicCentreName = academicCentre?.name;
		return academicCentre;
	}

	public getSpecialty(): Subject | undefined {
		if (this.specialtyId === undefined) return undefined;
		const subject = get(getSubject(this.specialtyId));
		this.lazySpecialtyName = subject?.name;
		return subject;
	}

	toString(): string {
		return `id: ${this.id}, name: ${this.name}, surenames: ${this.surenames}, role: ${this.role}, specialtyId: ${this.specialtyId}, academicCentreId: ${this.academicCentreId}, mainCourt: ${this.mainCourt}, lazyAcademicCentreName: ${this.lazyAcademicCentreName}, lazySpecialtyName: ${this.lazySpecialtyName}`;
	}
}

export const VigilantForCreate = z.object({
	name: Vigilant.Name,
	surenames: Vigilant.Surenames,
	role: Vigilant.Role,
	specialtyId: Vigilant.SpecialtyId,
	academicCentreId: Vigilant.AcademicCentreId,
	mainCourt: Vigilant.MainCourt
});
export type VigilantForCreate = z.infer<typeof VigilantForCreate>;

export const vigilantsStore = createStore<Vigilant>('vigilant');
