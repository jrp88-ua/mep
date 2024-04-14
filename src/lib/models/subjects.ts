import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';

export const SUBJECT_KIND_VALUES = ['OBLIGATORY', 'VOLUNTARY', 'UNKNOWN'] as const;
export type SubjectKind = (typeof SUBJECT_KIND_VALUES)[number];

export class Subject implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Kind = z.enum(SUBJECT_KIND_VALUES).default('UNKNOWN');
	static ExamDate = z.coerce.date();
	static ExamDuration = z.coerce.number().positive();
	static Type = z.object({
		id: Subject.Id,
		name: Subject.Name,
		kind: Subject.Kind,
		examDate: Subject.ExamDate.optional(),
		examDuration: Subject.ExamDuration.optional()
	});

	readonly id: ModelId;
	name: string;
	kind: SubjectKind;
	examDate: Date | undefined;
	examDuration: number | undefined;

	constructor(params: {
		id: ModelId;
		name: string;
		kind?: SubjectKind;
		examDate?: Date;
		examDuration?: number;
	}) {
		this.id = params.id;
		this.name = params.name;
		this.kind = params.kind || 'UNKNOWN';
		this.examDate = params.examDate;
		this.examDuration = params.examDuration;
	}

	setName(value: string): void {
		this.name = Subject.Name.parse(value);
	}

	setKind(value: SubjectKind): void {
		this.kind = Subject.Kind.parse(value);
	}

	setExamDate(value?: Date): void {
		this.examDate = Subject.ExamDate.parse(value);
	}
	setExamDuration(value?: number): void {
		this.examDuration = Subject.ExamDuration.parse(value);
	}

	toString(): string {
		return `id: ${this.id}, name: ${this.name}, kind: ${this.kind}, examDate: ${this.examDate}, examDuration: ${this.examDuration}`;
	}
}

export const SubjectForCreate = z.object({
	name: Subject.Name,
	kind: Subject.Kind,
	examDate: Subject.ExamDate.optional(),
	examDuration: Subject.ExamDuration.optional()
});
export type SubjectForCreate = z.infer<typeof SubjectForCreate>;

export const subjectsStore = createStore<Subject>('subject');
