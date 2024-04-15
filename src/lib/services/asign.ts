import type { Examinee } from '$lib/models/examinees';
import { Subject } from '$lib/models/subjects';
import { get } from 'svelte/store';
import { getAllExaminees } from './examinees';
import { getAllSubjects } from './subjects';

function groupExamineesBySubjects(): Map<Subject, Examinee[]> {
	const map = new Map<Subject, Examinee[]>();
	const subjects = get(getAllSubjects());
	for (const subject of subjects) {
		map.set(subject, []);
	}
	const examinees = get(getAllExaminees());
	for (const examinee of examinees) {
		for (const subject of examinee.getSubjects()) {
			map.get(subject)?.push(examinee);
		}
	}
	return map;
}

export function findExamDateCollisions(): [Subject, Subject][] {
	const subjects = get(getAllSubjects()).sort((a, b) => a.id - b.id);
	for (const subject of subjects) {
		if (subject.examStartDate === undefined || !subject.examStartDate.isValid)
			throw new Error(
				`Invalid exam date in subject id=${subject.id}, exam date is ${subject.examStartDate}`
			);
		if (subject.examDuration === undefined || !subject.examDuration.isValid)
			throw new Error(
				`Invalid exam duration in subject id=${subject.id}, exam duration is ${subject.examDuration}`
			);
	}

	const collisions: [Subject, Subject][] = [];

	for (let i = 0; i < subjects.length; i++) {
		for (let j = i + 1; j < subjects.length; j++) {
			const subjectA = subjects[i];
			const subjectB = subjects[j];

			let firstSubject;
			let seccondSubject;
			if (subjectA.examStartDate! <= subjectB.examStartDate!) {
				firstSubject = subjectA;
				seccondSubject = subjectB;
			} else {
				firstSubject = subjectB;
				seccondSubject = subjectA;
			}

			if (
				firstSubject.examStartDate! <= seccondSubject.examStartDate! &&
				seccondSubject.examStartDate! <= firstSubject.examFinishDate!
			) {
				collisions.push([subjectA, subjectB]);
			}
		}
	}

	return collisions;
}

function findExamineesExamnDateCollisions() {}
