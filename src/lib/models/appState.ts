import { get, writable } from 'svelte/store';
import type { ModelId } from './models';
import { info } from 'tauri-plugin-log-api';

export type AppState = {
	navigationBlockedReason: string | undefined;
	edittingExaminee: ModelId | undefined;
	edittingVigilant: ModelId | undefined;
	edittingAcademicCentre: ModelId | undefined;
	edittingSubject: ModelId | undefined;
	edittingClassroom: ModelId | undefined;
	openingFile: string | undefined;

	openedFile: { file: string; password: string } | undefined;
	fileIsSaved: boolean;
};

export const appState = (() => {
	const { update, subscribe } = writable<AppState>({
		navigationBlockedReason: undefined,
		edittingExaminee: undefined,
		edittingVigilant: undefined,
		edittingAcademicCentre: undefined,
		edittingSubject: undefined,
		edittingClassroom: undefined,
		openingFile: undefined,

		openedFile: undefined,
		fileIsSaved: true
	});

	function setOpenedFile(file?: { file: string; password: string }) {
		update((state) => ({ ...state, openedFile: file }));
		info(`Setted oppened file ${file?.file}`);
	}

	function getOpenedFile() {
		return get(appState).openedFile;
	}

	function setFileIsSaved(saved: boolean) {
		update((state) => ({ ...state, fileIsSaved: saved }));
		info(`Setted file is saved ${saved}`);
	}

	function isFileSaved() {
		return get(appState).fileIsSaved;
	}

	function setOpeningFile(file: string | undefined) {
		update((state) => ({ ...state, openingFile: file }));
		info(`Setted opening file ${file}`);
	}

	function getOpeningFile() {
		return get(appState).openingFile;
	}

	function allowsNavigation() {
		return get(appState).navigationBlockedReason === undefined;
	}

	function lockedNavigationReason() {
		return get(appState).navigationBlockedReason;
	}

	function lockNavigation(reason: string) {
		info('Locked app navigation: ' + reason);
		update((state) => ({ ...state, navigationBlockedReason: reason }));
	}

	function unlockNavigation() {
		info('Unlocked app navigation');
		update((state) => ({ ...state, navigationBlockedReason: undefined }));
	}

	function setEdittingExaminee(id?: ModelId) {
		info('Setted editting examinee: ' + id);
		update((state) => ({ ...state, edittingExaminee: id }));
	}

	function setEdittingVigilant(id?: ModelId) {
		info('Setted editting vigilant: ' + id);
		update((state) => ({ ...state, edittingVigilant: id }));
	}

	function setEdittingAcademicCentre(id?: ModelId) {
		info('Setted editting academic centre: ' + id);
		update((state) => ({ ...state, edittingAcademicCentre: id }));
	}

	function setEdittingSubject(id?: ModelId) {
		info('Setted editting subject: ' + id);
		update((state) => ({ ...state, edittingSubject: id }));
	}

	function setEdittingClassroom(id?: ModelId) {
		info('Setted editting classroom: ' + id);
		update((state) => ({ ...state, edittingClassroom: id }));
	}

	function getEdittingExaminee() {
		return get(appState).edittingExaminee;
	}

	function getEdittingVigilant() {
		return get(appState).edittingVigilant;
	}

	function getEdittingAcademicCentre() {
		return get(appState).edittingAcademicCentre;
	}

	function getEdittingSubject() {
		return get(appState).edittingSubject;
	}

	function getEdittingClassroom() {
		return get(appState).edittingClassroom;
	}

	return {
		subscribe,
		setOpenedFile,
		getOpenedFile,
		setFileIsSaved,
		isFileSaved,
		setOpeningFile,
		getOpeningFile,
		allowsNavigation,
		lockNavigation,
		unlockNavigation,
		lockedNavigationReason,
		setEdittingExaminee,
		getEdittingExaminee,
		setEdittingVigilant,
		getEdittingVigilant,
		setEdittingAcademicCentre,
		getEdittingAcademicCentre,
		setEdittingSubject,
		getEdittingSubject,
		setEdittingClassroom,
		getEdittingClassroom
	};
})();
