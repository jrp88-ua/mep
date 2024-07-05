/**
 * ASIGNMENT:
 * 1. Get all subjects ordered by start date in an array of arrays of {subjects} ({subjects}[] = array group)
 *  1.1. Collitions are placed in the same inner array
 *  1.2. Add all the examinees to this
 * 2. Split classrooms into each array group
 */

import { Classroom } from '$lib/models/classroom';
import type { Examinee } from '$lib/models/examinees';
import { Subject } from '$lib/models/subjects';
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

	function createNew(): Promise<AssignmentError[] | true> {
		return new Promise((resolve) => {
			appState.lockNavigation('Creando asignación');
			const created = orderAndGroupSubjects(get(getAllSubjects()));
			if (!created.ok) {
				resolve([created.error]);
				return;
			}
			const configuration: ExamsConfiguration =
				created.configuration instanceof IndividualExamConfiguration ||
				created.configuration instanceof CollidingExamsConfiguration
					? new ExamsConfiguration([created.configuration])
					: (created.configuration as ExamsConfiguration);

			setTimeout(() => {
				configuration.addClassrooms(get(getAllClassrooms()));
				configuration.addVigilants(get(getAllVigilants()));
				configuration.addExaminees(get(getAllExaminees()));
				const result = configuration.doAssignment();
				set(configuration);
				appState.unlockNavigation();
				resolve(result || true);
			});
		});
	}

	function useEmptyAssignment() {
		update((configuration) => {
			configuration?.useEmptyAssignment();
			return configuration;
		});
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
		parts,
		useEmptyAssignment,
		set
	};
})();

export type ExamDistribution = {
	subject: Subject;
	distribution: { classroom: Classroom; examinees: Examinee[]; vigilants: Vigilant[] }[];
	specialists: Vigilant[];
};

export type AssignmentError =
	| { type: 'not-enough-seats'; subject: Subject }
	| { type: 'not-enough-vigilants'; subject: Subject }
	| { type: 'no-classrooms' }
	| { type: 'not-enough-classrooms'; subjects: Subject[] }
	| { type: 'missing-exam-date'; subject: Subject }
	| { type: 'missing-specialist'; subject: Subject };
export type DistributionError = 'assignment-not-done';

export interface ExamConfiguration {
	addExaminees(examinees: readonly Examinee[]): void;
	addClassrooms(classrooms: readonly Classroom[]): void;
	addVigilants(vigilants: readonly Vigilant[]): void;
	doAssignment(): AssignmentError[];
	useEmptyAssignment(): void;
	hasEnoughCapacity(): 'no-problem' | 'could-use-more' | 'not-enough';
	getCapacities(): { totalCapacity: number; examCapacity: number };
}

export function orderAndGroupSubjects(
	subjects: Subject[]
): { ok: false; error: AssignmentError } | { ok: true; configuration: ExamConfiguration } {
	function examDateCollides(firstSubject: Subject, seccondSubject: Subject) {
		return (
			firstSubject.examStartDate! <= seccondSubject.examStartDate! &&
			seccondSubject.examStartDate! <= firstSubject.examFinishDate!
		);
	}

	const totalSubjects = subjects.length;
	if (totalSubjects === 0) return { ok: true, configuration: new ExamsConfiguration([]) };
	for (let i = 0; i < totalSubjects; i++) {
		const subject = subjects[i];
		if (subject.examStartDate === undefined || subject.examDuration === undefined)
			return { ok: false, error: { type: 'missing-exam-date', subject } };
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

	return { ok: true, configuration: collidingExamnsToConfiguration(grouped) };
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
