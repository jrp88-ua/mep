import type { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Vigilant } from '$lib/models/vigilant';
import { nameSorter } from '$lib/util';
import type { AssignmentError, ExamConfiguration } from './assign';
import { getHighestExamineeToVigilantRatio } from './assignUtils';
import { IndividualExamConfiguration } from './individualExamConfiguration';

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

	addVigilants(vigilants: readonly Vigilant[]): void {
		vigilants
			.filter((v) => v.role === 'MEMBER')
			.forEach(this.availableVigilants.add, this.availableVigilants);
	}

	doAssignment(): AssignmentError[] {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].resetClassroomsAndVigilants();
		}
		const classroomResult = this.assignClassrooms();
		const vigilantResult = this.assignVigilants();
		const result = classroomResult.concat(vigilantResult);
		if (result.length > 0) return result;

		return this.exams
			.map((exam) => exam.doAssignment())
			.reduce((accumulator, current) => accumulator.concat(current), []);
	}

	useEmptyAssignment(): void {
		for (let i = 0; i < this.exams.length; i++) {
			this.exams[i].useEmptyAssignment();
		}
	}

	private assignClassrooms(): AssignmentError[] {
		if (this.availableClassrooms.size < this.exams.length)
			return [{ type: 'not-enough-classrooms', subjects: this.exams.map((exam) => exam.subject) }];
		const classrooms = [...this.availableClassrooms].sort((a, b) => a.priority - b.priority);
		const exams = this.exams.toSorted((a, b) =>
			a.subject.examStartDate! < b.subject.examStartDate!
				? -1
				: a.subject.examStartDate! > b.subject.examStartDate!
				? 1
				: 0
		);

		function doAssignmentWith(
			capacityExtractor: (classroom: Classroom) => number
		):
			| { enoughSeats: false }
			| { enoughSeats: true; assignments: Map<IndividualExamConfiguration, Classroom[]> } {
			let classroomIndex = 0;
			const assignments = new Map<IndividualExamConfiguration, Classroom[]>();
			for (const exam of exams) {
				let examRequirements = exam.examinees.size;
				const assignedClassrooms = [] as Classroom[];
				while (examRequirements > 0) {
					if (classroomIndex >= classrooms.length) {
						return { enoughSeats: false };
					}
					const classroom = classrooms[classroomIndex];
					assignedClassrooms.push(classroom);
					examRequirements -= capacityExtractor(classroom);
					classroomIndex++;
				}
				assignments.set(exam, assignedClassrooms);
			}
			return { enoughSeats: true, assignments };
		}

		const assignmentByExamCapacity = doAssignmentWith((c) => c.examCapacity);
		if (assignmentByExamCapacity.enoughSeats) {
			assignmentByExamCapacity.assignments.forEach((assignedClassrooms, exam) =>
				exam.addClassrooms(assignedClassrooms)
			);
			return [];
		}

		const assignmentByTotalCapacity = doAssignmentWith((c) => c.totalCapacity);
		if (assignmentByTotalCapacity.enoughSeats) {
			assignmentByTotalCapacity.assignments.forEach((assignedClassrooms, exam) =>
				exam.addClassrooms(assignedClassrooms)
			);
			return [];
		}

		return [{ type: 'not-enough-classrooms', subjects: this.exams.map((exam) => exam.subject) }];
	}

	private assignVigilants(): AssignmentError[] {
		const vigilants = [...this.availableVigilants].sort(nameSorter);
		const distribution = new Map<
			IndividualExamConfiguration,
			{ readonly examinees: number; vigilants: number }
		>();
		const totalVigilants = vigilants.length;

		// first assign specialists
		for (const exam of this.exams) {
			const subject = exam.subject;
			const index = vigilants.findIndex((vigilant) => vigilant.specialtiesIds.has(subject.id));

			if (index === -1) return [{ type: 'missing-specialist', subject }];
			const specialist = vigilants[index];
			vigilants.splice(index, 1);
			exam.addVigilants([specialist]);
			distribution.set(exam, { examinees: exam.examinees.size, vigilants: 1 });
		}

		if (distribution.size === 0) return [];

		let distributedVigilants = distribution.size;
		while (distributedVigilants < totalVigilants) {
			// We have vigilants left to assign
			const highestRatio = getHighestExamineeToVigilantRatio(distribution, (highest) => highest)!;
			highestRatio[1].vigilants++;
			distributedVigilants++;
		}

		// When now know how many vigilants go to each classroom, so, just assign
		let lastIndex = 0;
		for (const exam of this.exams) {
			const v = distribution.get(exam)!;
			const total = v.vigilants - 1; // one of them is the specialist, already added
			exam.addVigilants(vigilants.slice(lastIndex, total + lastIndex));
			lastIndex += total;
		}

		return [];
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
