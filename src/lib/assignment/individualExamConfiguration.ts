import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Subject } from '$lib/models/subjects';
import type { Vigilant } from '$lib/models/vigilant';
import { nameSorter } from '$lib/util';
import type {
	AsignmentError as AssignmentError,
	DistributionError,
	ExamConfiguration,
	ExamDistribution
} from './assign';

export class IndividualExamConfiguration implements ExamConfiguration {
	subject: Subject;
	examinees: Set<Examinee>;
	classrooms: Set<Classroom>;
	vigilants: Set<Vigilant>;
	specialists: Set<Vigilant>;

	distribution: ExamDistribution | undefined;

	constructor(subject: Subject) {
		this.subject = subject;
		this.examinees = new Set();
		this.classrooms = new Set();
		this.vigilants = new Set();
		this.specialists = new Set();
	}

	private resetDistribution() {
		this.distribution = undefined;
	}

	addExaminees(examinees: readonly Examinee[]) {
		examinees
			.filter((examinee) => examinee.subjectsIds.has(this.subject.id))
			.forEach(this.examinees.add, this.examinees);
		this.resetDistribution();
	}

	addClassrooms(classrooms: readonly Classroom[]): void {
		classrooms
			.filter(({ courtLocation }) => courtLocation === undefined)
			.forEach(this.classrooms.add, this.classrooms);
		this.resetDistribution();
	}

	removeClassrooms(): void {
		this.classrooms.clear();
		this.resetDistribution();
	}

	addVigilants(vigilants: readonly Vigilant[]): void {
		vigilants = vigilants.filter(({ role }) => role === 'MEMBER');
		vigilants
			.filter((vigilant) => !vigilant.specialtiesIds.has(this.subject.id))
			.forEach(this.vigilants.add, this.vigilants);
		vigilants
			.filter((vigilant) => vigilant.specialtiesIds.has(this.subject.id))
			.forEach(this.specialists.add, this.specialists);
	}

	removeVigilants(): void {
		this.vigilants.clear();
		this.specialists.clear();
		this.resetDistribution();
	}

	getCapacities(): { totalCapacity: number; examCapacity: number } {
		return [...this.classrooms].reduce(
			(acumulator, current) => {
				acumulator.totalCapacity += current.totalCapacity;
				acumulator.examCapacity += current.examCapacity;
				return acumulator;
			},
			{ totalCapacity: 0, examCapacity: 0 }
		);
	}

	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough' {
		const needed = this.examinees.size;
		const { totalCapacity, examCapacity } = this.getCapacities();
		if (needed > totalCapacity) return 'not-enough';
		if (needed > examCapacity) return 'could-use-more';
		return 'no-problem';
	}

	useConfiguration(
		specialists: Vigilant[],
		classrooms: Map<Classroom, { examinees: number; vigilants: Vigilant[] }>
	) {
		this.addVigilants(specialists);
		this.distribution = {
			specialists: [...this.specialists],
			subject: this.subject,
			distribution: []
		};
		let lastIndex = 0;
		const allExaminees = [...this.examinees].sort(nameSorter);
		[...classrooms.entries()]
			.sort((a, b) => (a[0].priority - b[0].priority) * 1)
			.forEach(([classroom, examineesAndVigilants]) => {
				this.addVigilants(examineesAndVigilants.vigilants);
				this.distribution!.distribution.push({
					classroom,
					vigilants: examineesAndVigilants.vigilants.sort(nameSorter),
					examinees: allExaminees.slice(lastIndex, examineesAndVigilants.examinees + lastIndex)
				});
				lastIndex += examineesAndVigilants.examinees;
			});
	}

	private assignExaminees(): AssignmentError | undefined {
		const examinees = [...this.examinees].sort(nameSorter);
		const classrooms = [...this.classrooms].sort((a, b) => (a.priority - b.priority) * 1);
		const { examCapacity, totalCapacity } = this.getCapacities();
		const totalExaminees = examinees.length;

		// Know in % how many examineed each classroom will have
		const percentages: number[] = [];
		if (examCapacity > examinees.length) {
			for (const classroom of classrooms) percentages.push(classroom.examCapacity / examCapacity);
		} else {
			for (const classroom of classrooms) percentages.push(classroom.totalCapacity / totalCapacity);
		}

		// Ones the % is known, assign the known amount of examinees but floored
		const distribution = new Map<Classroom, number>();
		let assignedExaminees = 0;
		for (let i = 0; i < classrooms.length; i++) {
			const examineesForThisClassroom = Math.floor(percentages[i] * totalExaminees);
			distribution.set(classrooms[i], examineesForThisClassroom);
			assignedExaminees += examineesForThisClassroom;
		}

		// Since we were flooring, most likely not all examinees are assigned
		// First, add examineed to the classrooms that haven't filled their total capacity in order of priority
		{
			const classroomsWithSpace = classrooms.filter((c) => c.examCapacity > distribution.get(c)!);
			let i = 0;
			while (classroomsWithSpace.length > 0 && assignedExaminees < totalExaminees) {
				const classroom = classroomsWithSpace[i];
				const examineesInClassroom = distribution.get(classroom)! + 1;
				distribution.set(classroom, examineesInClassroom);
				assignedExaminees++;
				if (examineesInClassroom < classroom.examCapacity) {
					i = (i + 1) % classroomsWithSpace.length;
				} else {
					classroomsWithSpace.splice(i, 1);
				}
			}
		}

		// Now, either all examinees are assigned OR we ran out of classroom space for exams
		// So do the same but with the total capacity just in case
		{
			const classroomsWithSpace = classrooms.filter((c) => c.totalCapacity > distribution.get(c)!);
			let i = 0;
			while (classroomsWithSpace.length > 0 && assignedExaminees < totalExaminees) {
				const classroom = classroomsWithSpace[i];
				const examineesInClassroom = distribution.get(classroom)! + 1;
				distribution.set(classroom, examineesInClassroom);
				assignedExaminees++;
				if (examineesInClassroom < classroom.examCapacity) {
					i = (i + 1) % classroomsWithSpace.length;
				} else {
					classroomsWithSpace.splice(i, 1);
				}
			}
		}

		if (assignedExaminees < totalExaminees) {
			// At this point this should never be true since we checked if there is
			// enough space at the beggining but why not testing it again
			console.error(
				'The total capacity could not fit all the examinees',
				assignedExaminees,
				totalExaminees,
				this
			);
			return 'not-enough-seats';
		}

		let lastIndex = 0;
		for (const classroom of classrooms) {
			const total = distribution.get(classroom)!;
			this.distribution!.distribution.push({
				classroom,
				examinees: examinees.slice(lastIndex, total + lastIndex),
				vigilants: []
			});
			lastIndex += total;
		}
		return undefined;
	}

	private assignVigilants(): AssignmentError | undefined {
		if (this.vigilants.size < this.classrooms.size) return 'not-enough-vigilants';
		const vigilants = [...this.vigilants].sort(nameSorter);
		const totalVigilants = vigilants.length;
		const distribution = new Map<Classroom, { readonly examinees: number; vigilants: number }>();

		function getHighestExamineeToVigilantRatio() {
			const distributionAsList = [...distribution];
			const firstElement = distributionAsList[0];
			if (distributionAsList.length === 1) return firstElement;
			let highestRatio = firstElement[1].examinees / firstElement[1].vigilants;
			return distributionAsList.slice(1).reduce((highest, current) => {
				const currentRatio = current[1].examinees / current[1].vigilants;
				if (currentRatio < highestRatio) {
					return highest;
				} else if (currentRatio === highestRatio) {
					return highest[0].priority < current[0].priority ? highest : current;
				} else {
					highestRatio = currentRatio;
					return current;
				}
			}, firstElement);
		}

		// First make sure every class with examinees gets at least one vigilant
		this.distribution!.distribution.forEach(({ classroom, examinees }) => {
			if (examinees.length > 0) {
				distribution.set(classroom, {
					examinees: examinees.length,
					vigilants: 1
				});
			}
		});

		let assignedVigilants = distribution.size;

		while (assignedVigilants < totalVigilants) {
			// We have vigilants left to assign
			const highestRatio = getHighestExamineeToVigilantRatio();
			highestRatio[1].vigilants++;
			assignedVigilants++;
		}

		// When now know how many vigilants go to each classroom, so, just assign
		let lastIndex = 0;
		for (const assignment of this.distribution!.distribution) {
			const v = distribution.get(assignment.classroom);
			if (v === undefined) continue;
			const total = v.vigilants;
			assignment.vigilants = vigilants.slice(lastIndex, total + lastIndex);
			lastIndex += total;
		}

		return undefined;
	}

	doAssignment(): AssignmentError | undefined {
		this.resetDistribution();
		if (this.classrooms.size === 0) return 'no-classrooms';
		if (this.hasEnoughCapacity() === 'not-enough') return 'not-enough-seats';
		if (this.vigilants.size < this.classrooms.size) return 'not-enough-vigilants';
		this.distribution = {
			subject: this.subject,
			distribution: [],
			specialists: [...this.specialists]
		};
		const result = this.assignExaminees();
		if (result !== undefined) return result;
		return this.assignVigilants();
	}

	getDistribution(): ExamDistribution | DistributionError {
		if (this.distribution === undefined) return 'assignment-not-done';
		return this.distribution;
	}

	getSubject() {
		return this.subject;
	}
}
