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
import { derived, get, writable } from 'svelte/store';
import { CollidingExamsConfiguration } from './collidingExamsConfiguration';
import { ExamsConfiguration } from './examsConfiguration';
import { IndividualExamConfiguration } from './individualExamConfiguration';
import { getAllSubjects } from '$lib/services/subjects';
import { getAllClassrooms } from '$lib/services/classroom';
import { getAllVigilants } from '$lib/services/vigilant';
import { getAllExaminees } from '$lib/services/examinees';
import { appState } from '$lib/models/appState';

export const assignment = (function () {
	const { subscribe, set, update } = writable<ExamsConfiguration | undefined>();

	function createNew() {
		appState.lockNavigation('Creando asignación');
		let created = orderAndGroupSubjects(get(getAllSubjects()));
		if (typeof created === 'string') return false;
		if (
			created instanceof IndividualExamConfiguration ||
			created instanceof CollidingExamsConfiguration
		)
			created = new ExamsConfiguration([created]);
		set(created);
		setTimeout(() => {
			created.addClassrooms(get(getAllClassrooms()));
			created.addVigilants(get(getAllVigilants()));
			created.addExaminees(get(getAllExaminees()));
			created.doAssignment();
			update((v) => v);
			appState.unlockNavigation();
		});
		return true;
	}

	function removeAssignation() {
		set(undefined);
	}

	function parts() {
		return derived(assignment, (a) => a?.exams);
	}

	return {
		subscribe,
		createNew,
		removeAssignation,
		parts
	};
})();

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
	removeClassrooms(): void;
	removeVigilants(): void;
	doAssignment(): AsignmentError | undefined;
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
