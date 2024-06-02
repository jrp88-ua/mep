import { Examinee, ExamineeForCreate, examineesStore } from '$lib/models/examinees';
import type { ModelId } from '$lib/models/models';
import { get } from 'svelte/store';
import { getOrCreateAcademicCentre } from './academicCentres';
import { runExamineeAndVigilantHaveSameAcademicCentreCheck } from './warnings';

let currentId = 0;

export function createExaminee(values: ExamineeForCreate) {
	const parsed = ExamineeForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	if (values.academicCentre !== undefined && typeof values.academicCentre !== 'number') {
		let academicCentreToCreate = values.academicCentre;
		if (typeof academicCentreToCreate === 'string')
			academicCentreToCreate = { name: academicCentreToCreate };
		const ac = getOrCreateAcademicCentre(academicCentreToCreate);
		if (!ac) return false;
		values.academicCentre = ac.id;
	}
	const validValues = values as ExamineeForCreate & {
		academicCentre?: number | undefined;
	};
	const examinee = new Examinee({ id: currentId++, ...validValues });

	examineesStore.storeInstance(examinee);
	runExamineeAndVigilantHaveSameAcademicCentreCheck();
	return examinee;
}

export function findExamineeByNif(nif: string) {
	nif = nif.toLowerCase();
	return get(getAllExaminees()).find((e) => e.nif.toLowerCase() === nif);
}

export function getAllExaminees() {
	return examineesStore.getAllInstances();
}

export function getExaminee(id: ModelId) {
	return examineesStore.getInstance(id);
}

export function updatedExaminee(id: ModelId) {
	if (examineesStore.updatedInstance(id)) {
		runExamineeAndVigilantHaveSameAcademicCentreCheck();
		return true;
	}
	return false;
}

export function deleteExaminee(id: ModelId) {
	if (examineesStore.deleteInstance(id)) {
		runExamineeAndVigilantHaveSameAcademicCentreCheck();
		return true;
	}
	return false;
}

export function deleteExaminees(ids: ModelId[]) {
	const deleted = examineesStore.deleteInstances(ids);
	if (deleted.length > 0) runExamineeAndVigilantHaveSameAcademicCentreCheck();
	return deleted;
}
