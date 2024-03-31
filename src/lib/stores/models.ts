import { writable, get as getStore } from 'svelte/store';
import { ipc_invoke } from '$lib/ipc';
import { error, info } from 'tauri-plugin-log-api';
import { z } from 'zod';

enum StoreState {
	TO_LOAD,
	LOADING,
	LOADED
}

export const ModelId = z.number().min(-2_147_483_648).max(2_147_483_647);
export type ModelId = z.infer<typeof ModelId>;

export type Model = {
	id: ModelId;
};

function createPromise(): {
	resolve: (value: void | PromiseLike<void>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	reject: (reason?: any) => void;
	promise: Promise<void>;
} {
	let resolveFn: (value: void | PromiseLike<void>) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let rejectFn: (reason?: any) => void;
	const promise = new Promise<void>((resolve, reject) => {
		resolveFn = resolve;
		rejectFn = reject;
	});

	return {
		resolve: resolveFn!,
		reject: rejectFn!,
		promise
	};
}

export function createStore<M extends Model, MC, MU>(
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	modelFactory: { new (...args: any[]): M },
	modelIdentifierSingular: string,
	modelIdentifierPlural: string
) {
	const store = writable(new Map<ModelId, M>());

	let state = StoreState.TO_LOAD;

	let { resolve, reject, promise } = createPromise();

	async function load() {
		if (state === StoreState.LOADING) return await promise;
		if (state === StoreState.LOADED) return;
		state = StoreState.LOADING;
		const startTime = Date.now();
		info(`Loading ${modelIdentifierPlural} into store`);
		try {
			const result = await ipc_invoke<M[]>(`get_all_${modelIdentifierPlural}`);
			store.update((map) => {
				const newMap = new Map(map);
				for (let i = 0; i < result.length; i++) {
					try {
						const instance = new modelFactory(result[i]);
						newMap.set(instance.id, instance);
					} catch (e) {
						error(
							`Could not create a ${modelIdentifierSingular} instance from ${JSON.stringify(
								result[i]
							)}: ${JSON.stringify(e)}`
						);
						console.error(e);
						// TODO smth idk
					}
				}
				return newMap;
			});
			info(
				`Loaded ${result.length} ${modelIdentifierPlural} into the store in ${
					Date.now() - startTime
				}ms.`
			);
			state = StoreState.LOADED;
			resolve();
		} catch (e) {
			state = StoreState.TO_LOAD;
			reject(e);
			throw e;
		}
	}

	function clear() {
		state = StoreState.TO_LOAD;
		store.set(new Map<ModelId, M>());
		const p = createPromise();
		resolve = p.resolve;
		reject = p.reject;
		promise = p.promise;
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

		let instance: M;
		try {
			instance = new modelFactory(result);
		} catch (e) {
			error(
				`Could not create a ${modelIdentifierSingular} instance from ${JSON.stringify(
					result
				)}: ${JSON.stringify(e)}`
			);
			console.error(e);
			throw e;
		}

		info(`Created new ${modelIdentifierSingular}: ${instance?.toString()}`);
		store.update((map) => {
			const newMap = new Map(map);
			newMap.set(instance.id, instance);
			return newMap;
		});
		return result;
	}

	async function updateInstance(id: ModelId, values: MU) {
		if (!isLoaded()) await load();
		const result = await ipc_invoke<M>(`${modelIdentifierSingular}_update`, { id, values });

		let instance: M;
		try {
			instance = new modelFactory(result);
		} catch (e) {
			error(
				`Could not update a ${modelIdentifierSingular} instance from ${JSON.stringify(
					result
				)}: ${JSON.stringify(e)}`
			);
			console.error(e);
			throw e;
		}

		info(`Updated ${modelIdentifierSingular}: ${JSON.stringify(result)}`);
		store.update((map) => {
			const newMap = new Map(map);
			newMap.set(instance.id, instance);
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
