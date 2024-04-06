import { Examinee, ExamineeForCreate, examineesStore } from '$lib/models/examinees';
import type { ModelId } from '$lib/models/models';
import { createAcademicCentre } from './academicCentres';

let currentId = 0;

export function createExaminee(values: ExamineeForCreate) {
	const parsed = ExamineeForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	if (values.academicCentre !== undefined && typeof values.academicCentre !== 'number') {
		let academicCentreToCreate = values.academicCentre;
		if (typeof academicCentreToCreate === 'string')
			academicCentreToCreate = { name: academicCentreToCreate };
		const ac = createAcademicCentre(academicCentreToCreate);
		if (!ac) return false;
		values.academicCentre = ac.id;
	}

	const examinee = new Examinee({ id: currentId++, ...values });

	examineesStore.storeInstance(examinee);
	return examinee;
}

export function findExamineeByNif(nif: string) {
	return getAllExaminees().find((e) => e.nif === nif);
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