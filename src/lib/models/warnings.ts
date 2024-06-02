import { writable } from 'svelte/store';

export interface AppWarning<M> {
	type: string;
	severity: 'warning' | 'error';
	title: () => string;
	message: () => string;
	meta: M;
}

export const appWarnings = (() => {
	const { subscribe, update } = writable<AppWarning<unknown>[]>([]);

	function addWarning<M>(warning: AppWarning<M>) {
		update((state) => [...state, warning]);
	}

	function removeWarning(keepIf: (warning: AppWarning<unknown>) => boolean) {
		update((state) => state.filter(keepIf));
	}

	return { subscribe, addWarning, removeWarning };
})();
