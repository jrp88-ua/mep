import { get, writable } from 'svelte/store';
import type { ModelId } from './models';

export type AppState = {
	navigationBlockedReason: string | undefined;
	edittingSubject: ModelId | undefined;
};

export const appState = (() => {
	const { update, subscribe } = writable<AppState>({
		navigationBlockedReason: undefined,
		edittingSubject: undefined
	});

	function allowsNavigation() {
		return get(appState).navigationBlockedReason === undefined;
	}

	function lockedNavigationReason() {
		return get(appState).navigationBlockedReason;
	}

	function lockNavigation(reason: string) {
		update((state) => ({ ...state, navigationBlockedReason: reason }));
	}

	function unlockNavigation() {
		update((state) => ({ ...state, navigationBlockedReason: undefined }));
	}

	function setEdittingSubject(id?: ModelId) {
		update((state) => ({ ...state, edittingSubject: id }));
	}

	function getEdittingSubject() {
		return get(appState).edittingSubject;
	}

	return {
		subscribe,
		allowsNavigation,
		lockNavigation,
		unlockNavigation,
		lockedNavigationReason,
		setEdittingSubject,
		getEdittingSubject
	};
})();
