import type { ToastSettings } from '@skeletonlabs/skeleton';
import { store } from './stores/configuration';

export function showToast(settings: ToastSettings): ToastSettings {
	if (settings.autohide !== false) {
		settings = {
			autohide: true,
			timeout: store.getToastTime(),
			...settings
		};
	}
	return settings;
}

export function successToast(settings: ToastSettings): ToastSettings {
	return showToast({
		...settings
	});
}
