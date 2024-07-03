<script lang="ts">
	import * as m from '$paraglide/messages';
	import { ipc_invoke_result } from '$lib/ipc';
	import { appState } from '$lib/models/appState';
	import { makeSaveValuesObject } from '$lib/services/common';
	import { save } from '@tauri-apps/api/dialog';
	import { FileDropzone, ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { setFileIsSaved, setOpenedFile } from '$lib/services/appState';
	import type { SaveToFileError } from '$lib/types/generated/SaveToFileError';
	import { examineesStore } from '$lib/models/examinees';
	import { classroomsStore } from '$lib/models/classroom';
	import { subjectsStore } from '$lib/models/subjects';
	import { vigilantsStore } from '$lib/models/vigilant';
	import { academicCentresStore } from '$lib/models/academicCentres';
	import { assignment } from '$lib/assignment/assign';

	const toast = getToastStore();

	let selectedFile: string | undefined;
	let password = '';
	let saving = false;

	onMount(() => {
		const file = get(appState).openedFile;
		selectedFile = file?.file;
		password = file?.password ?? '';
	});

	async function onSaveAs() {
		const selected = await save({
			filters: [
				{
					name: 'MEP',
					extensions: ['mep']
				}
			]
		});

		if (selected === null) return;
		selectedFile = selected;
		callSave(selected, password);
	}

	function onSave() {
		if (selectedFile === undefined) {
			onSaveAs();
			return;
		}
		callSave(selectedFile, password);
	}

	async function callSave(file: string, password: string) {
		appState.lockNavigation(m.saving_file());
		saving = true;
		const result = await ipc_invoke_result<never, SaveToFileError>('save_file', {
			values: makeSaveValuesObject(),
			file,
			password
		});
		saving = false;
		appState.unlockNavigation();

		if (result.success) {
			showSuccessToast(toast, {
				message: m.file_saved()
			});
			setOpenedFile({ file, password });
			setFileIsSaved(true);
		} else {
			const title = m.could_not_save_file();
			switch (result.error.type) {
				case 'openFile':
					switch (result.error.case.type) {
						case 'permissions':
							showErrorToast(toast, {
								title,
								message: m.could_not_save_file_message_open_file_permission()
							});
							break;
						case 'other':
							showErrorToast(toast, {
								title,
								message: m.could_not_save_file_message_open_file_other()
							});
							break;
					}
					break;
				case 'passwordCheck':
				case 'keyDerivation':
				case 'createCipher':
					showErrorToast(toast, {
						title,
						message: m.could_not_save_file_message_open_file_internal_error()
					});
					break;
				case 'writing':
				case 'serialization':
					showErrorToast(toast, {
						title,
						message: m.could_not_save_file_message_writing()
					});
					break;
			}
		}
	}

	function onSubmit(e: SubmitEvent & { currentTarget: EventTarget & HTMLFormElement }) {
		if (e.submitter?.id === 'save') {
			onSave();
		} else if (e.submitter?.id === 'save-as') {
			onSaveAs();
		}
	}

	async function promptSelectFile(e: MouseEvent) {
		e.preventDefault();

		const selected = await save({
			filters: [
				{
					name: 'MEP',
					extensions: ['mep']
				}
			]
		});

		if (selected === null) return;
		selectedFile = selected;
	}

	$: hasValues =
		$academicCentresStore.size > 0 ||
		$classroomsStore.size > 0 ||
		$examineesStore.size > 0 ||
		$subjectsStore.size > 0 ||
		$vigilantsStore.size > 0 ||
		$assignment !== undefined ||
		$appState.openedFile !== undefined;
</script>

{#if hasValues}
	{#if saving}
		<div class=" flex flex-col items-center">
			<h2 class="text-2xl mb-5">{m.saving_file()}</h2>
			<ProgressRadial />
		</div>
	{:else}
		<form class="card p-4" on:submit|preventDefault={onSubmit}>
			<h3 class="text-xl p-2">{m.save_file()}</h3>
			<div class="p-2">
				<span>{m.file()}</span>
				<FileDropzone name="file" on:click={promptSelectFile} disabled={!hasValues}>
					<svelte:fragment slot="lead">
						<i class="fa-solid fa-file-import text-4xl" />
					</svelte:fragment>
					<svelte:fragment slot="message">
						{#if selectedFile === undefined}
							{m.select_file_drag_drop()}
						{:else}
							{selectedFile}
						{/if}
					</svelte:fragment>
					<svelte:fragment slot="meta">.mep</svelte:fragment>
				</FileDropzone>
			</div>
			<label class="label p-2">
				<span>{m.password()}</span>
				<input
					type="password"
					name="password"
					class="input"
					title="password"
					bind:value={password}
					disabled={!hasValues}
					required
				/>
			</label>
			<div class="btn-group variant-filled-primary m-2">
				<button id="save" disabled={!hasValues}>
					<span><i class="fa-solid fa-floppy-disk" /></span>
					{m.save()}
				</button>
				<button id="save-as" disabled={!hasValues}>
					<span><i class="fa-solid fa-floppy-disk" /></span>
					{m.save_as()}
				</button>
			</div>
		</form>
	{/if}
{/if}
