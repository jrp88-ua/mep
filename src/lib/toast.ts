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

export function showSuccessToast(settings: ToastSettings): ToastSettings {
	return showToast({
		...settings,
		background: 'variant-filled-success'
	});
}

export function showWarningToast(settings: ToastSettings): ToastSettings {
	return showToast({
		...settings,
		background: 'variant-filled-warning'
	});
}
