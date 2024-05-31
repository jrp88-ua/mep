import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';
import { DateTime, Duration } from 'luxon';

export const SUBJECT_KIND_VALUES = ['OBLIGATORY', 'VOLUNTARY', 'UNKNOWN'] as const;
export type SubjectKind = (typeof SUBJECT_KIND_VALUES)[number];

export class Subject implements Model {
	static Id = ModelId;
	static Name = z.string().trim().min(1);
	static Kind = z.enum(SUBJECT_KIND_VALUES).default('UNKNOWN');
	static ExamStartDate = z.coerce.date().transform((date) => DateTime.fromISO(date.toISOString()));
	static ExamDuration = z
		.preprocess((v) => {
			if (v instanceof Duration) return v.minutes;
			return v;
		}, z.union([z.number(), z.unknown()]))
		.pipe(
			z.coerce
				.number()
				.positive()
				.transform((minutes) => Duration.fromObject({ minutes }))
		);
	static Type = z.object({
		id: Subject.Id,
		name: Subject.Name,
		kind: Subject.Kind,
		examDate: Subject.ExamStartDate.optional(),
		examDuration: Subject.ExamDuration.optional()
	});

	readonly id: ModelId;
	name: string;
	kind: SubjectKind;
	examStartDate: DateTime | undefined;
	examDuration: Duration | undefined;

	constructor(params: {
		id: ModelId;
		name: string;
		kind?: SubjectKind;
		examStartDate?: DateTime;
		examDuration?: Duration;
	}) {
		this.id = params.id;
		this.name = params.name;
		this.kind = params.kind || 'UNKNOWN';
		this.examStartDate = params.examStartDate;
		this.examDuration = params.examDuration;
	}

	get examFinishDate() {
		if (!this.examStartDate || !this.examDuration) return undefined;
		return this.examStartDate.plus(this.examDuration);
	}

	setName(value: string): void {
		this.name = Subject.Name.parse(value);
	}

	setKind(value: SubjectKind): void {
		this.kind = Subject.Kind.parse(value);
	}

	setExamDate(value?: z.infer<typeof Subject.ExamStartDate>): void {
		this.examStartDate = Subject.ExamStartDate.parse(value);
	}

	setExamDuration(value?: Duration): void {
		this.examDuration = value;
	}

	toString(): string {
		return `id: ${this.id}, name: ${this.name}, kind: ${this.kind}, examStartDate: ${this.examStartDate}, examDuration: ${this.examDuration}`;
	}
}

export const SubjectForCreate = z.object({
	name: Subject.Name,
	kind: Subject.Kind,
	examStartDate: Subject.ExamStartDate.optional(),
	examDuration: Subject.ExamDuration.optional()
});
export type SubjectForCreate = z.infer<typeof SubjectForCreate>;

export const subjectsStore = createStore<Subject>('subject');
