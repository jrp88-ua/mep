/**
 * ASIGNMENT:
 * 1. Get all subjects ordered by start date in an array of arrays of {subjects} ({subjects}[] = array group)
 *  1.1. Collitions are placed in the same inner array
 *  1.2. Add all the examinees to this
 * 2. Split classrooms into each array group
 */

import { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import type { Subject } from '$lib/models/subjects';
import type { Vigilant } from '$lib/models/vigilant';
import { CollidingExamsConfiguration } from './collidingExamsConfiguration';
import { ExamsConfiguration } from './examsConfiguration';
import { IndividualExamConfiguration } from './individualExamConfiguration';

export type ExamDistribution = {
	subject: Subject;
	distribution: { classroom: Classroom; examinees: Examinee[]; vigilants: Vigilant[] }[];
};

export type AsignmentError = 'not-enough-seats' | 'not-enough-vigilants' | 'no-classrooms';
export type DistributionError = 'assignment-not-done';

export interface ExamConfiguration {
	addExaminees(examinees: readonly Examinee[]): void;
	addClassrooms(classrooms: readonly Classroom[]): void;
	addVigilants(vigilants: readonly Vigilant[]): void;
	doAssignment(): AsignmentError | undefined;
	getDistribution(): ExamDistribution[] | DistributionError;
	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough';
	getCapacities(): { totalCapacity: number; examCapacity: number };
}

export function orderAndGroupSubjects(subjects: Subject[]) {
	function examDateCollides(firstSubject: Subject, seccondSubject: Subject) {
		return (
			firstSubject.examStartDate! <= seccondSubject.examStartDate! &&
			seccondSubject.examStartDate! <= firstSubject.examFinishDate!
		);
	}

	const totalSubjects = subjects.length;
	if (totalSubjects === 0) return new ExamsConfiguration([]);
	for (let i = 0; i < totalSubjects; i++) {
		const subject = subjects[i];
		if (subject.examStartDate === undefined || subject.examDuration === undefined) return 'error';
	}

	const orderedSubjects = subjects.sort((a, b) =>
		a.examStartDate!.diff(b.examStartDate!).toMillis()
	);

	let lastSubject = subjects[0];
	let actualGroup = [lastSubject];
	const grouped = [actualGroup];

	for (let i = 1; i < totalSubjects; i++) {
		const subject = orderedSubjects[i];
		if (examDateCollides(lastSubject, subject)) {
			actualGroup.push(subject);
		} else {
			actualGroup = [subject];
			grouped.push(actualGroup);
		}
		lastSubject = subject;
	}

	return collidingExamnsToConfiguration(grouped);
}

export function collidingExamnsToConfiguration(grouped: Subject[][]) {
	if (grouped.length === 1) {
		const group = grouped[0];
		if (group.length === 1) return new IndividualExamConfiguration(group[0]);
		return new CollidingExamsConfiguration(
			group.map((subject) => new IndividualExamConfiguration(subject))
		);
	}
	return new ExamsConfiguration(
		grouped.map((collitions) =>
			collitions.length === 1
				? new IndividualExamConfiguration(collitions[0])
				: new CollidingExamsConfiguration(
						collitions.map((subject) => new IndividualExamConfiguration(subject))
				  )
		)
	);
}
