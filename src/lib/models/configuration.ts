import { get, writable } from 'svelte/store';

import { z } from 'zod';

export const Configuration = z.object({
	popupTime: z.coerce.number().int().finite().min(0)
});

export type Configuration = z.infer<typeof Configuration>;

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
