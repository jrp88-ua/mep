import type { ModelId } from '$lib/models/models';
import {
	Vigilant,
	VigilantForCreate,
	vigilantsStore,
	type VIGILANT_ROLE_VALUES
} from '$lib/models/vigilant';
import * as m from '$paraglide/messages';
import { get } from 'svelte/store';

let currentId = 0;

export function createVigilant(values: VigilantForCreate) {
	const parsed = VigilantForCreate.safeParse(values);
	if (!parsed.success) return false;
	values = parsed.data;

	const vigilant = new Vigilant({ id: currentId++, ...values });

	vigilantsStore.storeInstance(vigilant);
	return vigilant;
}

export function VigilantExists(predicate: (vigilant: Vigilant) => boolean) {
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
