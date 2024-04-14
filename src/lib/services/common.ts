import type { ExamineeImportValues } from '$lib/types/generated/ExamineeImportValues';
import { createAcademicCentre, findAcademicCentreByName } from './academicCentres';
import { createExaminee } from './examinees';
import { createSubject, getOrCreateSubject, subjectExists } from './subjects';

export type ImportValuesMoment = {
	subjects: {
		done: number;
		created: number;
		total: number;
	};
	academicCentres: {
		created: number;
	};
	examinees: {
		created: number;
		total: number;
	};
	total: number;
	done: number;
};

export function* importValues(
	values: ExamineeImportValues
): Generator<Promise<ImportValuesMoment>> {
	const imported: ImportValuesMoment = {
		subjects: {
			done: 0,
			created: 0,
			total: values.subjects.length
		},
		academicCentres: {
			created: 0
		},
		examinees: {
			created: 0,
			total: values.examinees.length
		},
		total: values.subjects.length + values.examinees.length,
		done: 0
	};

	for (const subjectValues of values.subjects) {
		imported.subjects.done++;
		imported.done++;
		if (!subjectExists((subject) => subject.name === subjectValues.name)) {
			if (!createSubject(subjectValues)) {
				//todo
				return;
			}
			imported.subjects.created++;
		}

		yield new Promise((res) => setTimeout(() => res(imported)));
	}

	for (const examineeValues of values.examinees) {
		imported.done++;
		if (examineeValues.academicCentre) {
			let academicCentre = findAcademicCentreByName(examineeValues.academicCentre as string);
			if (academicCentre === undefined) {
				const created = createAcademicCentre({ name: examineeValues.academicCentre as string });
				if (!created) {
					//todo
					return;
				}
				imported.academicCentres.created++;
				academicCentre = created;
			}
			examineeValues.academicCentre = academicCentre.id;
		}
		examineeValues.subjectsIds = [];
		for (const subjectName of examineeValues.subjects) {
			const subject = getOrCreateSubject({ name: subjectName, kind: 'UNKNOWN' });
			if (!subject) {
				//todo
				return;
			}
			examineeValues.subjectsIds.push(subject.id);
		}

		if (!createExaminee(examineeValues)) {
			//todo
			return;
		}
		imported.examinees.created++;
		yield new Promise((res) => setTimeout(() => res(imported)));
	}

	yield new Promise((res) => setTimeout(() => res(imported)));
}
