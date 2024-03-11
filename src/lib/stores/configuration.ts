import { Configuration } from '$lib/types/configuration';
import { get, writable } from 'svelte/store';

export const appConfiguration = (() => {
	const { set, subscribe } = writable<Configuration>({
		popupTime: 10000
	});

	function getToastTime() {
		return get(appConfiguration).popupTime;
	}

	return {
		subscribe,
		getToastTime,
		set
	};
})();
