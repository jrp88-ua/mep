import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';

export const SUBJECT_KIND_VALUES = ['OBLIGATORY', 'VOLUNTARY', 'UNKNOWN'] as const;

export class Subject implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Kind = z.enum(SUBJECT_KIND_VALUES).default('UNKNOWN');
	static Type = z.object({
		id: Subject.Id,
		name: Subject.Name,
		kind: Subject.Kind
	});

	readonly id: ModelId;
	name: string;
	kind: (typeof SUBJECT_KIND_VALUES)[number];

	constructor(params: { id: ModelId; name: string; kind?: (typeof SUBJECT_KIND_VALUES)[number] }) {
		this.id = params.id;
		this.name = params.name;
		this.kind = params.kind || 'UNKNOWN';
	}

	setName(value: string): void {
		this.name = Subject.Name.parse(value);
	}

	setKind(value: (typeof SUBJECT_KIND_VALUES)[number]): void {
		this.kind = Subject.Kind.parse(value);
	}

	toString(): string {
		return `id: ${this.id}, name: ${this.name}, kind: ${this.kind}`;
	}
}

export const SubjectForCreate = z.object({
	name: Subject.Name,
	kind: Subject.Kind
});
export type SubjectForCreate = z.infer<typeof SubjectForCreate>;

export const subjectsStore = createStore<Subject>('subject');
