import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Vigilant } from '$lib/models/vigilant';
import type { AsignmentError, ExamConfiguration, ExamDistribution } from './assign';
import type { IndividualExamConfiguration } from './individualExamConfiguration';

export class CollidingExamsConfiguration implements ExamConfiguration {
	exams: IndividualExamConfiguration[];
	availableClassrooms: Classroom[];

	constructor(exams: IndividualExamConfiguration[]) {
		this.exams = exams;
		this.availableClassrooms = [];
	}

	addExaminees(examinees: Examinee[]) {
		this.exams.forEach((exam) => exam.addExaminees(examinees));
	}

	addClassrooms(classrooms: Classroom[]): void {
		this.availableClassrooms.concat(classrooms);
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

	getDistribution(): ExamDistribution[] | 'assignment-not-done' {
		throw new Error('Not implemented');
	}

	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough' {
		throw new Error('Not implemented');
	}
}
