import { get, writable } from 'svelte/store';

export type AppState = {
	navigationBlockedReason: string | undefined;
};

export const appState = (() => {
	const { update, subscribe } = writable<AppState>({
		navigationBlockedReason: undefined
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

	return {
		subscribe,
		allowsNavigation,
		lockNavigation,
		unlockNavigation,
		lockedNavigationReason
	};
})();
