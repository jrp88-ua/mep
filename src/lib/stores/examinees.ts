import { writable, get } from 'svelte/store';
import type { Examinee } from '../../types/Examinee';
import type { ExamineeForCreate } from '../../types/ExamineeForCreate';
import { ipc_invoke } from '$lib/ipc';
import type { ExamineeForUpdate } from '../../types/ExamineeForUpdate';
import { info } from 'tauri-plugin-log-api';

enum StoreState {
	TO_LOAD,
	LOADING,
	LOADED
}

export const store = (() => {
	const { subscribe, update } = writable(new Map<number, Examinee>());

	let state = StoreState.TO_LOAD;
	async function loadExaminees() {
		if (state !== StoreState.TO_LOAD) return;
		const startTime = Date.now();
		info('Loading examinees into store');
		state = StoreState.LOADING;
		try {
			const result = await ipc_invoke<Examinee[]>('get_all_examinees');
			update((map) => {
				const newMap = new Map(map);
				for (let i = 0; i < result.length; i++) {
					const examinee = result[i];
					newMap.set(examinee.id, Object.freeze(examinee));
				}
				return newMap;
			});
			info(`Loaded ${result.length} examinees into the store in ${Date.now() - startTime}ms.`);
			state = StoreState.LOADED;
		} catch (e) {
			state = StoreState.TO_LOAD;
			throw e;
		}
	}

	function isLoaded() {
		return state === StoreState.LOADED;
	}

	async function getExaminees() {
		if (!isLoaded()) await loadExaminees();
		return Array.from(get(store).values());
	}

	async function getExaminee(id: number) {
		if (!isLoaded()) await loadExaminees();
		return get(store).get(id);
	}

	async function createExaminee(values: ExamineeForCreate) {
		if (!isLoaded()) await loadExaminees();
		const result = await ipc_invoke<Examinee>('create_examinee', {values});
		info(`Created new examinee: ${JSON.stringify(result)}`);
		update((map) => {
			const newMap = new Map(map);
			newMap.set(result.id, Object.freeze(result));
			return newMap;
		});
		return result;
	}

	async function updateExaminee(id: number, values: ExamineeForUpdate) {
		if (!isLoaded()) await loadExaminees();
		const result = await ipc_invoke<Examinee>('examinee_update', { id, values });
		info(`Updated examinee: ${JSON.stringify(result)}`);
		update((map) => {
			const newMap = new Map(map);
			newMap.set(result.id, Object.freeze(result));
			return newMap;
		});
		return result;
	}

	async function deleteExaminee(id: number) {
		if (!isLoaded()) await loadExaminees();
		const result = await ipc_invoke<Examinee>('examinee_delete', { id });
		if (result) {
			info(`Deleted examinee with id ${id}`);
			update((map) => {
				const newMap = new Map(map);
				newMap.delete(id);
				return newMap;
			});
		}
		return result;
	}

	return {
		subscribe,
		getExaminees,
		getExaminee,
		createExaminee,
		updateExaminee,
		deleteExaminee
	};
})();
