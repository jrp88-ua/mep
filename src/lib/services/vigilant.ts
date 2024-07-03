import type { ModelId } from '$lib/models/models';
import {
	Vigilant,
	VigilantForCreate,
	vigilantsStore,
	type VIGILANT_ROLE_VALUES
} from '$lib/models/vigilant';
import * as m from '$paraglide/messages';
import { get } from 'svelte/store';
import { getOrCreateAcademicCentre } from './academicCentres';
import { runExamineeAndVigilantHaveSameAcademicCentreCheck } from './warnings';

export let currentId = 0;

export function setCurrentId(id: number) {
	currentId = id;
}

export function createVigilant(values: VigilantForCreate) {
	const parsed = VigilantForCreate.safeParse(values);
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

	const validValues = values as VigilantForCreate & {
		academicCentre?: number | undefined;
	};

	const vigilant = new Vigilant({ id: currentId++, ...validValues });

	vigilantsStore.storeInstance(vigilant);
	runExamineeAndVigilantHaveSameAcademicCentreCheck();
	return vigilant;
}

export function findVigilantByName(name: string, surenames?: string) {
	name = name.toLowerCase();
	surenames = (surenames ?? '').toLowerCase();
	return get(getAllVigilants()).find(
		(vigilant) =>
			vigilant.name.toLowerCase() === name && vigilant.surenames.toLowerCase() === surenames
	);
}

export function findCourtPresident(court: number) {
	return get(getAllVigilants()).find(
		(vigilant) => vigilant.mainCourt === court && vigilant.role === 'PRESIDENT'
	);
}

export function findCourtSecretary(court: number) {
	return get(getAllVigilants()).find(
		(vigilant) => vigilant.mainCourt === court && vigilant.role === 'SECRETARY'
	);
}

export function vigilantExists(predicate: (vigilant: Vigilant) => boolean) {
	return get(getAllVigilants()).find(predicate) !== undefined;
}

export function getAllVigilants() {
	return vigilantsStore.getAllInstances();
}

export function getVigilant(id: ModelId) {
	return vigilantsStore.getInstance(id);
}

export function updatedVigilant(id: ModelId) {
	const result = vigilantsStore.updatedInstance(id);
	if (result) runExamineeAndVigilantHaveSameAcademicCentreCheck();
	return result;
}

export function deleteVigilant(id: ModelId) {
	if (vigilantsStore.deleteInstance(id)) {
		runExamineeAndVigilantHaveSameAcademicCentreCheck();
		return true;
	}
	return false;
}

export function deleteVigilants(ids: ModelId[]) {
	const deleted = vigilantsStore.deleteInstances(ids);
	if (deleted.length > 0) runExamineeAndVigilantHaveSameAcademicCentreCheck();
	return deleted;
}

export function vigilantRoleValuesTranslate(kind: (typeof VIGILANT_ROLE_VALUES)[number]) {
	switch (kind) {
		case 'PRESIDENT':
			return m.vigilant_role_president();
		case 'SECRETARY':
			return m.vigilant_role_secretary();
		case 'MEMBER':
			return m.vigilant_role_member();
	}
}
