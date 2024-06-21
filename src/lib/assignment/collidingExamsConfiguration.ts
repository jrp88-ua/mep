import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Vigilant } from '$lib/models/vigilant';
import type { AsignmentError, ExamConfiguration, ExamDistribution } from './assign';
import type { IndividualExamConfiguration } from './individualExamConfiguration';

export class CollidingExamsConfiguration implements ExamConfiguration {
	exams: IndividualExamConfiguration[];
	availableClassrooms: Set<Classroom>;
	availableVigilants: Set<Vigilant>;

	constructor(exams: IndividualExamConfiguration[]) {
		this.exams = exams;
		this.availableClassrooms = new Set();
		this.availableVigilants = new Set();
	}

	addExaminees(examinees: Examinee[]) {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].addExaminees(examinees);
		}
	}

	addClassrooms(classrooms: Classroom[]): void {
		classrooms
			.filter(({ courtLocation }) => courtLocation === undefined)
			.forEach(this.availableClassrooms.add, this.availableClassrooms);
	}

	removeClassrooms(): void {
		this.availableClassrooms.clear();
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].removeClassrooms();
		}
	}

	addVigilants(vigilants: readonly Vigilant[]): void {
		vigilants.forEach(this.availableVigilants.add, this.availableVigilants);
	}

	removeVigilants(): void {
		this.availableVigilants.clear();
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].removeVigilants();
		}
	}

	doAssignment(): AsignmentError | undefined {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].removeVigilants();
			this.exams[i].removeClassrooms();
		}

		throw new Error('Not implemented');

		return undefined;
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

	getDistribution(): ExamDistribution[] | 'assignment-not-done' {
		const distributions: ExamDistribution[] = [];
		for (let i = 0; i < this.exams.length; i++) {
			const d = this.exams[i].getDistribution();
			if (typeof d === 'string') return 'assignment-not-done';
			for (let j = 0; j < d.length; j++) {
				distributions.push(d[j]);
			}
		}
		return distributions;
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
