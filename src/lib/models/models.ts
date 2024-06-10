import { setFileIsSaved } from '$lib/services/appState';
import { writable, get, derived } from 'svelte/store';
import { error, info } from 'tauri-plugin-log-api';
import { z } from 'zod';

export const ModelId = z.number().min(-2_147_483_648).max(2_147_483_647);
export type ModelId = z.infer<typeof ModelId>;

export type Model = {
	id: ModelId;
	toString(): string;
};

export function createStore<M extends Model>(modelName: string) {
	const store = writable(new Map<ModelId, M>());
	const allInstances = derived(store, ($store) => {
		return Array.from($store.values());
	});

	function clear() {
		store.set(new Map<ModelId, M>());
		setFileIsSaved(false);
	}

	function getAllInstances() {
		return allInstances;
	}

	function getInstance(id: ModelId) {
		return derived(store, ($store) => $store.get(id));
	}

	function storeInstance(instance: M) {
		try {
			store.update((map) => {
				const newMap = new Map(map);
				newMap.set(instance.id, instance);
				return newMap;
			});
			info(`Created new instance of ${modelName}: ${instance.id}`);
			setFileIsSaved(false);
			return instance;
		} catch (e) {
			error(`Error creating instance of ${modelName}: ${JSON.stringify(e)}`);
			return false;
		}
	}

	function storeInstances(instances: M[]) {
		try {
			store.update((map) => {
				const newMap = new Map(map);
				for (const instance of instances) newMap.set(instance.id, instance);
				return newMap;
			});
			info(`Created ${instances.length} new instances of ${modelName}`);
			setFileIsSaved(false);
			return instances;
		} catch (e) {
			error(`Error creating instances of ${modelName}: ${JSON.stringify(e)}`);
			return false;
		}
	}

	function updatedInstance(id: ModelId) {
		try {
			const instance = get(store).get(id);
			if (instance === undefined) {
				return false;
			}

			store.update((map) => {
				const newMap = new Map(map);
				newMap.set(id, instance);
				return newMap;
			});
			setFileIsSaved(false);
			info(`Updated instance of ${modelName}: ${instance.toString()}`);
			return true;
		} catch (e) {
			error(`Error updating instance of ${modelName}: ${JSON.stringify(e)}`);
			return false;
		}
	}

	function deleteInstance(id: ModelId) {
		if (!get(store).has(id)) return false;

		store.update((map) => {
			const newMap = new Map(map);
			newMap.delete(id);
			return newMap;
		});
		setFileIsSaved(false);
		info(`Deleted instance of ${modelName} with id ${id}`);
		return true;
	}

	function deleteInstances(ids: ModelId[]): ModelId[] {
		const deleted: ModelId[] = [];
		store.update((map) => {
			const newMap = new Map(map);
			for (const id of ids) {
				if (newMap.delete(id)) {
					deleted.push(id);
				}
			}
			return newMap;
		});
		if (deleted.length > 0) {
			setFileIsSaved(false);
			info(`Deleted ${deleted.length} instance(s) of ${modelName} (ids=${deleted})`);
		}
		return deleted;
	}

	info(`Created ${modelName} store`);

	return {
		subscribe: store.subscribe,
		clear,
		getAllInstances,
		getInstance,
		storeInstance,
		storeInstances,
		updatedInstance,
		deleteInstance,
		deleteInstances
	};
}
