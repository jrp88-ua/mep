import type { ToastSettings, getToastStore } from '@skeletonlabs/skeleton';
import { appConfiguration } from './models/configuration';

export type CustomToastSettings = ToastSettings & { title?: string | undefined };

export function showToast(
	toastStore: ReturnType<typeof getToastStore>,
	settings: CustomToastSettings
) {
	if (settings.autohide !== false) {
		const timeout = settings.message.split(' ').length * appConfiguration.getToastTime();
		settings = {
			autohide: true,
			timeout,
			...settings
		};
	}
	if (settings.title !== undefined) {
		const { title, message } = settings;
		settings.message = `<strong>${title}</strong><br>${message}`;
	}
	return toastStore.trigger(settings);
}

export function showSuccessToast(
	toastStore: ReturnType<typeof getToastStore>,
	settings: CustomToastSettings
) {
	return showToast(toastStore, {
		...settings,
		background: 'variant-filled-success'
	});
}

export function showWarningToast(
	toastStore: ReturnType<typeof getToastStore>,
	settings: CustomToastSettings
) {
	return showToast(toastStore, {
		...settings,
		background: 'variant-filled-warning'
	});
}

export function showErrorToast(
	toastStore: ReturnType<typeof getToastStore>,
	settings: CustomToastSettings
) {
	return showToast(toastStore, {
		...settings,
		background: 'variant-filled-error'
	});
}
