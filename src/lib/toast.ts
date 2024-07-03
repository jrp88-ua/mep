import type { ToastSettings, getToastStore } from '@skeletonlabs/skeleton';
import { appConfiguration } from './models/configuration';

export type CustomToastSettings = Omit<ToastSettings, 'message'> & {
	title?: string;
	message: string | string[];
};

export function showToast(
	toastStore: ReturnType<typeof getToastStore>,
	settings: CustomToastSettings
) {
	settings.message =
		typeof settings.message === 'string' ? settings.message : settings.message.join('<br>');
	if (settings.autohide !== false) {
		const timeout = settings.message.split(' ').length * appConfiguration.getToastTime();
		settings = {
			autohide: true,
			timeout,
			...settings
		};
	}
	if (settings.title !== undefined) {
		const { title } = settings;
		settings.message = `<strong>${title}</strong><br>${settings.message}`;
	}
	return toastStore.trigger(settings as ToastSettings);
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
