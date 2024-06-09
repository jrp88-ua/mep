import type { ExamineeImportValues } from '$lib/types/generated/ExamineeImportValues';
import { get } from 'svelte/store';
import {
	createAcademicCentre,
	findAcademicCentreByName,
	getAllAcademicCentres
} from './academicCentres';
import { createExaminee, getAllExaminees } from './examinees';
import { createSubject, getAllSubjects, getOrCreateSubject, subjectExists } from './subjects';
import { getAllVigilants } from './vigilant';
import { getAllClassrooms } from './classroom';
import type { AppValues } from '$lib/types/generated/AppValues';
import type { Examinee } from '$lib/types/generated/Examinee';
import type { AcademicCentre } from '$lib/types/generated/AcademicCentre';
import type { Subject } from '$lib/types/generated/Subject';
import type { Vigilant } from '$lib/types/generated/Vigilant';
import type { Classroom } from '$lib/types/generated/Classroom';

export function makeSaveValuesObject(): AppValues {
	const examinees: Examinee[] = get(getAllExaminees()).map((examinee) => ({
		id: examinee.id,
		nif: examinee.nif,
		name: examinee.name,
		surenames: examinee.surenames,
		court: examinee.court,
		origin: examinee.origin,
		academicCentreId: examinee.academicCentreId ?? null,
		subjectsIds: [...examinee.subjectsIds]
	}));
	const academicCentres: AcademicCentre[] = get(getAllAcademicCentres()).map((academicCentre) => ({
		id: academicCentre.id,
		name: academicCentre.name
	}));
	const subjects: Subject[] = get(getAllSubjects()).map((subject) => ({
		id: subject.id,
		name: subject.name,
		kind: subject.kind,
		examDate: subject.examStartDate?.toISO() ?? null,
		examDuration: subject.examDuration?.toISO() ?? null
	}));
	const vigilants: Vigilant[] = get(getAllVigilants()).map((vigilant) => ({
		id: vigilant.id,
		name: vigilant.name,
		surenames: vigilant.surenames,
		role: vigilant.role,
		mainCourt: vigilant.mainCourt,
		academicCentreId: vigilant.academicCentreId ?? null,
		specialtiesIds: [...vigilant.specialtiesIds]
	}));
	const classrooms: Classroom[] = get(getAllClassrooms()).map((classroom) => ({
		id: classroom.id,
		code: classroom.code,
		locationCode: classroom.locationCode,
		courtLocation: classroom.courtLocation ?? null,
		kind: classroom.kind,
		totalCapacity: classroom.totalCapacity,
		examCapacity: classroom.examCapacity,
		priority: classroom.priority,
		notes: classroom.notes
	}));

	return {
		examinees,
		academicCentres,
		subjects,
		vigilants,
		classrooms
	};
}

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
