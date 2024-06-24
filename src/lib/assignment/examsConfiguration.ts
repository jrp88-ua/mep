import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Vigilant } from '$lib/models/vigilant';
import type { AsignmentError, ExamConfiguration } from './assign';

export class ExamsConfiguration implements ExamConfiguration {
	exams: ExamConfiguration[];

	constructor(exams: ExamConfiguration[]) {
		this.exams = exams;
	}

	addExaminees(examinees: Examinee[]) {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].addExaminees(examinees);
		}
	}

	addClassrooms(classrooms: Classroom[]): void {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].addClassrooms(classrooms);
		}
	}

	removeClassrooms(): void {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].removeClassrooms();
		}
	}

	addVigilants(vigilants: readonly Vigilant[]): void {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].addVigilants(vigilants);
		}
	}

	removeVigilants(): void {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].removeVigilants();
		}
	}

	doAssignment(): AsignmentError | undefined {
		for (let i = 0; i < this.exams.length; i++) {
			const result = this.exams[i].doAssignment();
			if (result !== undefined) return result;
		}
	}

	getCapacities(): { totalCapacity: number; examCapacity: number } {
		const capacities = { totalCapacity: 0, examCapacity: 0 };
		for (let i = 0; i < this.exams.length; i++) {
			const capacity = this.exams[i].getCapacities();
			capacities.totalCapacity += capacity.totalCapacity;
			capacities.examCapacity += capacity.examCapacity;
		}
		return capacities;
	}

	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough' {
		let couldUseMore = false;
		for (let i = 0; i < this.exams.length; i++) {
			const result = this.exams[i].hasEnoughCapacity();
			if (result === 'not-enough') return 'not-enough';
			couldUseMore ||= result === 'could-use-more';
		}
		return couldUseMore ? 'could-use-more' : 'no-problem';
	}
}
