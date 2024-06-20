import { z } from 'zod';
import { ModelId, createStore, type Model } from './models';

export class Classroom implements Model {
	static Id = ModelId;
	static Code = z.string().trim();
	static LocationCode = z.string().trim();
	static TotalCapacity = z.coerce.number().min(1);
	static ExamCapacity = z.coerce.number().min(1);
	static Priority = z.coerce.number().positive().default(1);
	static CourtLocation = z
		.preprocess(
			(v) => (v === 0 ? 0 : v || undefined),
			z.union([z.string(), z.number(), z.undefined()])
		)
		.pipe(z.coerce.number().finite().gte(-32768).lte(32767).optional());
	static Kind = z.string();
	static Notes = z.string().array();
	static Type = z.object({
		id: Classroom.Id,
		code: Classroom.Code,
		locationCode: Classroom.LocationCode,
		totalCapacity: Classroom.TotalCapacity,
		examCapacity: Classroom.ExamCapacity,
		priority: Classroom.Priority,
		courtLocation: Classroom.CourtLocation,
		kind: Classroom.Kind,
		notes: Classroom.Notes
	});

	readonly id: ModelId;
	code: string;
	locationCode: string;
	totalCapacity: number;
	examCapacity: number;
	priority: number;
	courtLocation: number | undefined;
	kind: string;
	notes: string[];

	constructor(params: {
		id: ModelId;
		code: string;
		locationCode: string;
		totalCapacity: number;
		examCapacity: number;
		priority: number;
		courtLocation?: number | null;
		kind: string;
		notes: string[];
	}) {
		this.id = params.id;
		this.code = params.code;
		this.locationCode = params.locationCode;
		this.totalCapacity = params.totalCapacity;
		this.examCapacity = params.examCapacity;
		this.priority = params.priority;
		this.courtLocation = params.courtLocation ?? undefined;
		this.kind = params.kind;
		this.notes = params.notes;
	}

	setCode(value: string): void {
		this.code = Classroom.Code.parse(value);
	}

	setLocationCode(value: string): void {
		this.locationCode = Classroom.LocationCode.parse(value);
	}

	setTotalCapacity(value: number): void {
		this.totalCapacity = Classroom.TotalCapacity.parse(value);
	}

	setExamCapacity(value: number): void {
		this.examCapacity = Classroom.ExamCapacity.parse(value);
	}

	setCapacities(total: number, exam?: number): void {
		total = Classroom.TotalCapacity.parse(total);
		exam = Classroom.ExamCapacity.parse(exam ?? Math.floor(total / 3));
		this.totalCapacity = total;
		this.examCapacity = exam;
	}

	setPriority(value: number): void {
		this.priority = Classroom.Priority.parse(value);
	}

	setCourtLocation(value?: number): void {
		this.courtLocation = Classroom.CourtLocation.parse(value);
	}

	setKind(value: string): void {
		this.kind = Classroom.Kind.parse(value);
	}

	setNotes(value: string[]): void {
		this.notes = Classroom.Notes.parse(value);
	}

	toString(): string {
		return `id: ${this.id}, code: ${this.code}, locationCode: ${this.locationCode}, totalCapacity: ${this.totalCapacity}, examCapacity: ${this.examCapacity}, priority: ${this.priority}, courtLocation: ${this.courtLocation}, kind: ${this.kind}, notes: ${this.notes}`;
	}
}

export const ClassroomForCreate = z.object({
	code: Classroom.Code,
	locationCode: Classroom.LocationCode,
	totalCapacity: Classroom.TotalCapacity,
	examCapacity: Classroom.ExamCapacity,
	priority: Classroom.Priority,
	courtLocation: Classroom.CourtLocation,
	kind: Classroom.Kind,
	notes: z.union([Classroom.Notes, z.string().transform((s) => s.split('\n'))])
});
export type ClassroomForCreate = z.infer<typeof ClassroomForCreate>;

export const classroomsStore = createStore<Classroom>('classroom');
