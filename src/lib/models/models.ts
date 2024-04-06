import { writable, get as getStore, get } from 'svelte/store';
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

	function clear() {
		store.set(new Map<ModelId, M>());
	}

	function getAllInstances() {
		return Array.from(getStore(store).values());
	}

	function getInstance(id: ModelId) {
		return getStore(store).get(id);
	}

	function storeInstance(instance: M) {
		try {
			store.update((map) => {
				const newMap = new Map(map);
				newMap.set(instance.id, instance);
				return newMap;
			});
			info(`Created new instance of ${modelName}: ${instance.toString()}`);
			return instance;
		} catch (e) {
			error(`Error creating instance of ${modelName}: ${JSON.stringify(e)}`);
			return false;
		}
	}

	function updatedInstance(id: ModelId) {
		try {
			const instance = getInstance(id);
			if (instance === undefined) {
				return false;
			}

			info(`Updated instance of ${modelName}: ${instance.toString()}`);
			store.update((map) => {
				const newMap = new Map(map);
				newMap.set(id, instance);
				return newMap;
			});
			return true;
		} catch (e) {
			error(`Error updating instance of ${modelName}: ${JSON.stringify(e)}`);
			return false;
		}
	}

	function deleteInstance(id: ModelId) {
		if (!get(store).has(id)) return false;

		info(`Deleted instance of ${modelName} with id ${id}`);
		store.update((map) => {
			const newMap = new Map(map);
			newMap.delete(id);
			return newMap;
		});
		return true;
	}

	return {
		subscribe: store.subscribe,
		clear,
		getAllInstances,
		getInstance,
		storeInstance,
		updatedInstance,
		deleteInstance
	};
}
