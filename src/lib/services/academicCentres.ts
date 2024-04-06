import {
	AcademicCentre,
	AcademicCentreForCreate,
	academicCentresStore
} from '$lib/models/academicCentres';
import type { ModelId } from '$lib/models/models';

let currentId = 0;

export function createAcademicCentre(values: AcademicCentreForCreate) {
	const parsed = AcademicCentreForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	const academicCentre = new AcademicCentre({ id: currentId++, ...values });

	academicCentresStore.storeInstance(academicCentre);
	return academicCentre;
}

export function findAcademicCentreByName(name: string) {
	return getAllAcademicCentres().find((ac) => ac.name === name);
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
	return academicCentresStore.deleteInstance(id);
}
