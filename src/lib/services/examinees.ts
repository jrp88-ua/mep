import { Examinee, ExamineeForCreate, examineesStore } from '$lib/models/examinees';
import type { ModelId } from '$lib/models/models';
import { get } from 'svelte/store';
import { getOrCreateAcademicCentre } from './academicCentres';

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
	return examineesStore.updatedInstance(id);
}

export function deleteExaminee(id: ModelId) {
	return examineesStore.deleteInstance(id);
}

export function deleteExaminees(ids: ModelId[]) {
	return examineesStore.deleteInstances(ids);
}
