import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Subject } from '$lib/models/subjects';
import type {
	AsignmentError as AssignmentError,
	DistributionError,
	ExamConfiguration,
	ExamineeDistribution
} from './assign';

export class IndividualExamConfiguration implements ExamConfiguration {
	subject: Subject;
	examinees: Examinee[];
	classrooms: Classroom[];

	examineesDistribution: ExamineeDistribution | undefined;

	constructor(subject: Subject) {
		this.subject = subject;
		this.examinees = [];
		this.classrooms = [];
	}

	private resetDistribution() {
		this.examineesDistribution = undefined;
	}

	asignExaminees(examinees: readonly Examinee[]) {
		this.examinees = examinees.filter((examinee) => examinee.subjectsIds.has(this.subject.id));
		this.resetDistribution();
	}

	addClassrooms(classrooms: readonly Classroom[]): void {
		this.classrooms = this.classrooms.concat(classrooms);
		this.resetDistribution();
	}

	getCapacities(): { totalCapacity: number; examCapacity: number } {
		return this.classrooms.reduce(
			(acumulator, current) => {
				acumulator.totalCapacity += current.totalCapacity;
				acumulator.examCapacity += current.examCapacity;
				return acumulator;
			},
			{ totalCapacity: 0, examCapacity: 0 }
		);
	}

	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough' {
		const needed = this.examinees.length;
		const { totalCapacity, examCapacity } = this.getCapacities();
		if (needed > totalCapacity) return 'not-enough';
		if (needed > examCapacity) return 'could-use-more';
		return 'no-problem';
	}

	doAssignment(): AssignmentError | undefined {
		this.resetDistribution();
		if (this.hasEnoughCapacity() === 'not-enough') return 'not-enough-seats';
		const examinees = this.examinees.sort(nameSorter);
		const classrooms = this.classrooms.sort((a, b) => (a.priority - b.priority) * 1);
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

		const examineesDistribution: ExamineeDistribution = { subject: this.subject, distribution: [] };
		let lastIndex = 0;
		for (const classroom of classrooms) {
			const total = distribution.get(classroom)!;
			examineesDistribution.distribution.push({
				classroom,
				examinees: examinees.slice(lastIndex, total + lastIndex)
			});
			lastIndex += total;
		}

		this.examineesDistribution = Object.freeze(examineesDistribution);
		return undefined;
	}

	getExamineesDistribution(): ExamineeDistribution[] | DistributionError {
		if (this.examineesDistribution === undefined) return 'assignment-not-done';
		return [this.examineesDistribution];
	}
}

function nameSorter(
	a: { name: string; surenames: string },
	b: { name: string; surenames: string }
) {
	let comparison = a.surenames.localeCompare(b.surenames);
	if (comparison === 0) comparison = a.name.localeCompare(b.name);
	return comparison;
}
