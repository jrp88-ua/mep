import { Examinee } from '$lib/models/examinees';
import { Subject } from '$lib/models/subjects';

export function groupExamineesBySubjects(
	subjects: Subject[],
	examinees: Examinee[]
): Map<Subject, Examinee[]> {
	subjects = subjects.toSorted((a, b) => a.id - b.id);
	examinees = examinees.toSorted((a, b) => a.id - b.id);
	const map = new Map<Subject, Examinee[]>();
	for (const subject of subjects) {
		map.set(subject, []);
	}
	for (const examinee of examinees) {
		for (const subject of examinee.getSubjects()) {
			map.get(subject)!.push(examinee);
		}
	}
	return map;
}

export function findExamDateCollisions(subjects: Subject[]) {
	subjects = subjects.toSorted((a, b) => a.id - b.id);
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
		const subjectA = subjects[i];
		for (let j = i + 1; j < subjects.length; j++) {
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

export function findExamineesWithExamnDateCollisions(examinees: Examinee[]) {
	examinees = examinees.toSorted((a, b) => a.id - b.id);

	const examineesWithCollisions = new Map<Examinee, [Subject, Subject][]>();

	for (const examinee of examinees) {
		const collisions = findExamDateCollisions(examinee.getSubjects());
		if (collisions.length !== 0) examineesWithCollisions.set(examinee, collisions);
	}

	return examineesWithCollisions;
}
