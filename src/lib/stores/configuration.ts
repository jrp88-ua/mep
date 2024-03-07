import { Configuration } from '$lib/types/configuration';
import { get, writable } from 'svelte/store';

export const store = (() => {
	const { set, subscribe } = writable<Configuration>({
		popupTime: 10000
	});

	function getToastTime() {
		return get(store).popupTime;
	}

	return {
		subscribe,
		getToastTime,
		set
	};
})();
