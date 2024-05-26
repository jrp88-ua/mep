import {
	AcademicCentre,
	AcademicCentreForCreate,
	academicCentresStore
} from '$lib/models/academicCentres';
import { examineesStore } from '$lib/models/examinees';
import type { ModelId } from '$lib/models/models';
import { vigilantsStore } from '$lib/models/vigilant';
import { get } from 'svelte/store';

let currentId = 0;

export function createAcademicCentre(values: AcademicCentreForCreate) {
	const parsed = AcademicCentreForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	const academicCentre = new AcademicCentre({ id: currentId++, ...values });

	academicCentresStore.storeInstance(academicCentre);
	return academicCentre;
}

export function getOrCreateAcademicCentre(values: AcademicCentreForCreate) {
	return findAcademicCentreByName(values.name) || createAcademicCentre(values);
}

export function findAcademicCentreByName(name: string) {
	name = name.toLowerCase();
	return get(getAllAcademicCentres()).find((ac) => ac.name.toLowerCase() === name);
}

export function getAllAcademicCentres() {
	return academicCentresStore.getAllInstances();
}

export function getAcademicCentre(id: ModelId) {
	return academicCentresStore.getInstance(id);
}

export function updatedAcademicCentre(id: ModelId) {
	return academicCentresStore.updatedInstance(id);
}

export function deleteAcademicCentre(id: ModelId) {
	if (academicCentresStore.deleteInstance(id)) {
		deleteCentreFromExamineesAndVigilants(id);
		return true;
	}
	return false;
}

export function deleteAcademicCentres(ids: ModelId[]) {
	const deleted = academicCentresStore.deleteInstances(ids);
	deleted.forEach((id) => deleteCentreFromExamineesAndVigilants(id));
	return deleted;
}

function deleteCentreFromExamineesAndVigilants(id: ModelId) {
	get(examineesStore.getAllInstances()).forEach((examinee) => {
		if (examinee.academicCentreId === id) {
			examinee.setAcademicCentreId(undefined);
			examineesStore.updatedInstance(examinee.id);
		}
	});
	get(vigilantsStore.getAllInstances()).forEach((vigilant) => {
		if (vigilant.academicCentreId === id) {
			vigilant.setAcademicCentreId(undefined);
			vigilantsStore.updatedInstance(vigilant.id);
		}
	});
}
