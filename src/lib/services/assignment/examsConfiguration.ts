import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { AsignmentError, ExamConfiguration, ExamDistribution } from './assign';

export class ExamsConfiguration implements ExamConfiguration {
	exams: ExamConfiguration[];

	constructor(exams: ExamConfiguration[]) {
		this.exams = exams;
	}

	asignExaminees(examinees: Examinee[]) {
		this.exams.forEach((exam) => exam.asignExaminees(examinees));
	}

	addClassrooms(classrooms: Classroom[]): void {
		this.exams.forEach((exam) => exam.addClassrooms(classrooms));
	}

	addVigilants(vigilants: readonly Vigilant[]): void {
		throw new Error('Not implemented');
	}

	doAssignment(): AsignmentError | undefined {
		throw new Error('Not implemented');
	}

	getCapacities(): { totalCapacity: number; examCapacity: number } {
		throw new Error('Not implemented');
	}

	getExamineesDistribution(): ExamDistribution[] | 'assignment-not-done' {
		throw new Error('Not implemented');
	}

	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough' {
		throw new Error('Not implemented');
	}
}
