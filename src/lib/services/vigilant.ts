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

let currentId = 0;

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
	return vigilant;
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
	return vigilantsStore.updatedInstance(id);
}

export function deleteVigilant(id: ModelId) {
	return vigilantsStore.deleteInstance(id);
}

export function deleteVigilants(ids: ModelId[]) {
	return vigilantsStore.deleteInstances(ids);
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
