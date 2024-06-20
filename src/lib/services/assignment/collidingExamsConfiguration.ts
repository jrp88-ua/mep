import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { AsignmentError, ExamConfiguration, ExamineeDistribution } from './assign';
import type { IndividualExamConfiguration } from './individualExamConfiguration';

export class CollidingExamsConfiguration implements ExamConfiguration {
	exams: IndividualExamConfiguration[];
	availableClassrooms: Classroom[];

	constructor(exams: IndividualExamConfiguration[]) {
		this.exams = exams;
		this.availableClassrooms = [];
	}

	asignExaminees(examinees: Examinee[]) {
		this.exams.forEach((exam) => exam.asignExaminees(examinees));
	}

	removeExaminees(): void {
		throw new Error('Not implemented');
	}

	addClassrooms(classrooms: Classroom[]): void {
		this.availableClassrooms.concat(classrooms);
	}

	removeClassrooms(): void {
		throw new Error('Not implemented');
	}

	doAssignment(): AsignmentError | undefined {
		throw new Error('Not implemented');
	}

	getCapacities(): { totalCapacity: number; examCapacity: number } {
		throw new Error('Not implemented');
	}

	getExamineesDistribution(): ExamineeDistribution[] | 'assignment-not-done' {
		throw new Error('Not implemented');
	}

	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough' {
		throw new Error('Not implemented');
	}
}
