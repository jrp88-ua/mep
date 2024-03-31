import { z } from 'zod';
import { ModelId, createStore } from './models';

export const SUBJECT_KIND_VALUES = ['OBLIGATORY', 'VOLUNTARY', 'UNKNOWN'] as const;

export class Subject {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Kind = z.enum(SUBJECT_KIND_VALUES).default('UNKNOWN');
	static Type = z.object({
		id: Subject.Id,
		name: Subject.Name,
		kind: Subject.Kind
	});

	readonly id: ModelId;
	readonly name: string;
	readonly kind: (typeof SUBJECT_KIND_VALUES)[number];

	constructor(params: { id: ModelId; name: string; kind?: (typeof SUBJECT_KIND_VALUES)[number] }) {
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

export const subjectsStore = createStore<Subject, SubjectForCreate, SubjectForUpdate>(
	Subject,
	'subject',
	'subjects'
);
