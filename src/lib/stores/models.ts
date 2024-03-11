import { writable, get as getStore } from 'svelte/store';
import { ipc_invoke } from '$lib/ipc';
import { info } from 'tauri-plugin-log-api';
import type {
	AcademicCentre,
	AcademicCentreForCreate,
	AcademicCentreForUpdate,
	Examinee,
	ExamineeForCreate,
	ExamineeForUpdate,
	Model
} from '$lib/types/models';

enum StoreState {
	TO_LOAD,
	LOADING,
	LOADED
}

export async function reloadAllStores() {
	examineesStore.clear();
	academicCentresStore.clear();
	await examineesStore.getAllInstances();
	await academicCentresStore.getAllInstances();
}

export const examineesStore = createStore<Examinee, ExamineeForCreate, ExamineeForUpdate>(
	'examinee',
	'examinees'
);

export const academicCentresStore = createStore<
	AcademicCentre,
	AcademicCentreForCreate,
	AcademicCentreForUpdate
>('academic_centre', 'academic_centres');

function createStore<M extends Model, MC, MU>(
	modelIdentifierSingular: string,
	modelIdentifierPlural: string
) {
	const store = writable(new Map<ModelId, M>());

	let state = StoreState.TO_LOAD;
	async function load() {
		if (state !== StoreState.TO_LOAD) return;
		const startTime = Date.now();
		info(`Loading ${modelIdentifierPlural} into store`);
		state = StoreState.LOADING;
		try {
			const result = await ipc_invoke<M[]>(`get_all_${modelIdentifierPlural}`);
			store.update((map) => {
				const newMap = new Map(map);
				for (let i = 0; i < result.length; i++) {
					const instance = result[i];
					newMap.set(instance.id, Object.freeze(instance));
				}
				return newMap;
			});
			info(
				`Loaded ${result.length} ${modelIdentifierPlural} into the store in ${
					Date.now() - startTime
				}ms.`
			);
			state = StoreState.LOADED;
		} catch (e) {
			state = StoreState.TO_LOAD;
			throw e;
		}
	}

	function clear() {
		state = StoreState.TO_LOAD;
		store.set(new Map<ModelId, M>());
	}

	function isLoaded() {
		return state === StoreState.LOADED;
	}

	async function getAllInstances() {
		if (!isLoaded()) await load();
		return Array.from(getStore(store).values());
	}

	async function getInstance(id: ModelId) {
		if (!isLoaded()) await load();
		return getStore(store).get(id);
	}

	async function createInstance(values: MC) {
		if (!isLoaded()) await load();
		const result = await ipc_invoke<M>(`create_${modelIdentifierSingular}`, { values });
		info(`Created new ${modelIdentifierSingular}: ${JSON.stringify(result)}`);
		store.update((map) => {
			const newMap = new Map(map);
			newMap.set(result.id, Object.freeze(result));
			return newMap;
		});
		return result;
	}

	async function updateInstance(id: ModelId, values: MU) {
		if (!isLoaded()) await load();
		const result = await ipc_invoke<M>(`${modelIdentifierSingular}_update`, { id, values });
		info(`Updated ${modelIdentifierSingular}: ${JSON.stringify(result)}`);
		store.update((map) => {
			const newMap = new Map(map);
			newMap.set(result.id, Object.freeze(result));
			return newMap;
		});
		return result;
	}

	async function deleteInstance(id: ModelId) {
		if (!isLoaded()) await load();
		const result = await ipc_invoke<boolean>(`${modelIdentifierSingular}_delete`, { id });
		if (result) {
			info(`Deleted ${modelIdentifierSingular} with id ${id}`);
			store.update((map) => {
				const newMap = new Map(map);
				newMap.delete(id);
				return newMap;
			});
		}
		return result;
	}

	return {
		subscribe: store.subscribe,
		clear,
		isLoaded,
		getAllInstances,
		getInstance,
		createInstance,
		updateInstance,
		deleteInstance
	};
}
