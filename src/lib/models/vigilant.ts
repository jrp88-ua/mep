import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';
import { Subject } from './subjects';
import { AcademicCentre, AcademicCentreForCreate } from './academicCentres';
import { getAcademicCentre } from '$lib/services/academicCentres';
import { get } from 'svelte/store';
import { getSubject } from '$lib/services/subjects';
import { warn } from 'tauri-plugin-log-api';

export const VIGILANT_ROLE_VALUES = ['PRESIDENT', 'SECRETARY', 'MEMBER'] as const;
export type VigilantRole = (typeof VIGILANT_ROLE_VALUES)[number];

export class Vigilant implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Surenames = z.string().trim();
	static Role = z.enum(VIGILANT_ROLE_VALUES).default('MEMBER');
	static SpecialtiesIds = Subject.Id.array().default([]);
	static AcademicCentreId = AcademicCentre.Id.optional();
	static MainCourt = z.coerce.number().finite().gte(-32768).lte(32767);
	static Type = z.object({
		id: Vigilant.Id,
		name: Vigilant.Name,
		surenames: Vigilant.Surenames,
		role: Vigilant.Role,
		specialtiesIds: Vigilant.SpecialtiesIds,
		academicCentreId: Vigilant.AcademicCentreId,
		mainCourt: Vigilant.MainCourt
	});

	readonly id: ModelId;
	name: string;
	surenames: string;
	role: VigilantRole;
	specialtiesIds: Set<number>;
	academicCentreId: number | undefined;
	mainCourt: number;

	lazyAcademicCentreName: undefined | string = undefined;
	lazySpecialtiesNames: string[] = [];

	constructor(params: {
		id: ModelId;
		name: string;
		surenames: string;
		role: VigilantRole;
		specialtiesIds?: number[];
		academicCentre?: number;
		mainCourt: number;
	}) {
		this.id = params.id;
		this.name = params.name;
		this.surenames = params.surenames;
		this.role = params.role;
		this.specialtiesIds = new Set(params.specialtiesIds || []);
		this.academicCentreId = params.academicCentre;
		this.mainCourt = params.mainCourt;
	}

	setName(value: string): void {
		this.name = Vigilant.Name.parse(value);
	}

	setSurenames(value: string): void {
		this.surenames = Vigilant.Surenames.parse(value);
	}

	setRole(value: VigilantRole): void {
		this.role = Vigilant.Role.parse(value);
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

	setSpecialties(specialtyId: number[]) {
		this.specialtiesIds = new Set(specialtyId);
		this.getSpecialties();
	}

	addSpecialty(specialtyId: number[]) {
		const oldLength = this.specialtiesIds.size;
		for (const id of specialtyId) {
			this.specialtiesIds.add(id);
		}
		if (oldLength !== this.specialtiesIds.size) this.getSpecialties();
	}

	removeSpecialties(specialtyId: number[]) {
		let changed = false;
		for (const id of specialtyId) {
			changed = this.specialtiesIds.delete(id) || changed;
		}
		if (changed) this.getSpecialties();
		return changed;
	}

	setMainCourt(value: number): void {
		this.mainCourt = Vigilant.MainCourt.parse(value);
	}

	public getSpecialties(): Subject[] {
		const ar = [];
		this.lazySpecialtiesNames.length = 0;
		for (const id of this.specialtiesIds) {
			const subject = get(getSubject(id));
			if (subject === undefined) {
				warn(`Vigilant id=${this.id} has as specialty id=${id} but the subject does not exist`);
				continue;
			}
			ar.push(subject);
			this.lazySpecialtiesNames.push(subject.name);
		}
		return ar;
	}

	public getAcademicCentre(): AcademicCentre | undefined {
		if (this.academicCentreId === undefined) return undefined;
		const academicCentre = get(getAcademicCentre(this.academicCentreId));
		this.lazyAcademicCentreName = academicCentre?.name;
		return academicCentre;
	}

	toString(): string {
		return `id: ${this.id}, name: ${this.name}, surenames: ${this.surenames}, role: ${this.role}, specialtiesIds: ${this.specialtiesIds}, academicCentreId: ${this.academicCentreId}, mainCourt: ${this.mainCourt}, lazyAcademicCentreName: ${this.lazyAcademicCentreName}, lazySpecialtiesNames: ${this.lazySpecialtiesNames}`;
	}
}

export const VigilantForCreate = z.object({
	name: Vigilant.Name,
	surenames: Vigilant.Surenames,
	role: Vigilant.Role,
	specialtiesIds: Vigilant.SpecialtiesIds,
	academicCentre: z.union([AcademicCentre.Id, AcademicCentreForCreate, z.string()]).optional(),
	mainCourt: Vigilant.MainCourt
});
export type VigilantForCreate = z.infer<typeof VigilantForCreate>;

export const vigilantsStore = createStore<Vigilant>('vigilant');
