import { appState } from '$lib/models/appState';
import * as m from '$paraglide/messages';
import { appWindow } from '@tauri-apps/api/window';

export async function setOpenedFile(file: string | undefined) {
	appState.setOpenedFile(file);
	await updateAppTitle();
}

export async function setFileIsSaved(saved: boolean) {
	appState.setFileIsSaved(saved);
	await updateAppTitle();
}

async function updateAppTitle() {
	const file = appState.getOpenedFile();
	const saved = appState.isFileSaved();
	const message = file !== undefined ? m.app_title_file({ file }) : m.app_title_no_file();

	await appWindow.setTitle((saved ? '' : '*') + message);
}
