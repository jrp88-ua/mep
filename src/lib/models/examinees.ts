import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';
import { AcademicCentre, AcademicCentreForCreate } from './academicCentres';
import { get } from 'svelte/store';
import { getAcademicCentre } from '$lib/services/academicCentres';
import { Subject } from './subjects';
import { getSubject } from '$lib/services/subjects';
import { warn } from 'tauri-plugin-log-api';

export class Examinee implements Model {
	static Id = ModelId;
	static Nif = z.string().trim().min(1);
	static Name = z.string().trim().min(1);
	static Surenames = z.string().trim();
	static Origin = z.string().trim().min(1);
	static Court = z.coerce.number().finite().gte(-32768).lte(32767);
	static SubjectsIds = Subject.Id.array().default([]);
	static AcademicCentreId = AcademicCentre.Id.optional();
	static Type = z.object({
		id: Examinee.Id,
		nif: Examinee.Nif,
		name: Examinee.Name,
		surenames: Examinee.Surenames,
		origin: Examinee.Origin,
		court: Examinee.Court,
		subjectsIds: Examinee.SubjectsIds,
		academicCentreId: Examinee.AcademicCentreId.optional()
	});

	readonly id: ModelId;
	nif: string;
	name: string;
	surenames: string;
	origin: string;
	court: number;
	subjectsIds: Set<number>;
	academicCentreId: number | undefined;

	lazyAcademicCentreName: undefined | string = undefined;
	lazySubjectsNames: string[] = [];

	constructor(params: {
		id: ModelId;
		nif: string;
		name: string;
		surenames?: string;
		origin: string;
		court: number;
		subjectsIds?: number[];
		academicCentre?: ModelId;
	}) {
		this.id = params.id;
		this.nif = params.nif;
		this.name = params.name;
		this.surenames = params.surenames || '';
		this.origin = params.origin;
		this.court = params.court;
		this.subjectsIds = new Set(params.subjectsIds || []);
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
			this.getAcademicCentre();
		} else {
			this.academicCentreId = undefined;
			this.lazyAcademicCentreName = undefined;
		}
	}

	public getAcademicCentre(): AcademicCentre | undefined {
		if (this.academicCentreId === undefined) return undefined;
		const academicCentre = get(getAcademicCentre(this.academicCentreId));
		this.lazyAcademicCentreName = academicCentre?.name;
		return academicCentre;
	}

	addSubject(...subjectsIds: number[]) {
		const oldLength = this.subjectsIds.size;
		for (const id of subjectsIds) {
			this.subjectsIds.add(id);
		}
		if (oldLength !== this.subjectsIds.size) this.getSubjects();
	}

	removeSubject(...subjectsIds: number[]) {
		let changed = false;
		for (const id of subjectsIds) {
			changed = this.subjectsIds.delete(id) || changed;
		}
		if (changed) this.getSubjects();
	}

	public getSubjects(): Subject[] {
		const ar = [];
		this.lazySubjectsNames.length = 0;
		for (const id of this.subjectsIds) {
			const subject = get(getSubject(id));
			if (subject === undefined) {
				warn(`Examinee id=${this.id} has as subject id=${id} but the subject does not exist`);
				continue;
			}
			ar.push(subject);
			this.lazySubjectsNames.push(subject.name);
		}
		return ar;
	}

	toString(): string {
		return `id: ${this.id}, nif: ${this.nif}, name: ${this.name}, surenames: ${this.surenames}, origin: ${this.origin}, court: ${this.court}, subjectsIds: ${this.subjectsIds}, academicCentreId: ${this.academicCentreId}, lazySubjectsNames: ${this.lazySubjectsNames}, lazyAcademicCentreName: ${this.lazyAcademicCentreName}`;
	}
}

export const ExamineeForCreate = z.object({
	nif: Examinee.Nif,
	name: Examinee.Name,
	surenames: Examinee.Surenames,
	origin: Examinee.Origin,
	court: Examinee.Court,
	subjectsIds: z.union([Examinee.SubjectsIds, Subject.Type.array(), Subject.Name.array()]),
	academicCentre: z.union([AcademicCentre.Id, AcademicCentreForCreate, z.string()]).optional()
});
export type ExamineeForCreate = z.infer<typeof ExamineeForCreate>;

export const examineesStore = createStore<Examinee>('examinee');
