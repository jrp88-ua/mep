<script lang="ts">
	import * as m from '$paraglide/messages';

	import { open } from '@tauri-apps/api/dialog';
	import { FileDropzone, ProgressBar } from '@skeletonlabs/skeleton';
	import { createEventDispatcher, onMount } from 'svelte';
	import { ipc_invoke } from '$lib/ipc';
	import type { ExcelSheet } from '$lib/types/generated/ExcelSheet';
	enum States {
		WAITING_FOR_FILE,
		VERIFYING_FILE,
		FILE_OK,
		INVALID_FILE
	}

	const dispatch = createEventDispatcher();

	let state: States = States.WAITING_FOR_FILE;
	let invalidFileMessage: string | undefined;

	export let selectedFile: string | undefined = undefined;

	$: canShooseFile = state === States.WAITING_FOR_FILE || state === States.INVALID_FILE;

	onMount(() => {
		if (selectedFile !== undefined) {
			state = States.FILE_OK;
		}
	});

	async function promptSelectFile(e: MouseEvent) {
		e.preventDefault();
		if (!canShooseFile) return;
		const selected = await open({
			multiple: false,
			filters: [
				{
					name: m.examinees_import_file_excel(),
					extensions: ['xls', 'xlsx', 'xlsm', 'xlsb', 'xla', 'xlam', 'ods']
				}
			]
		});
		if (selected !== null && !Array.isArray(selected)) {
			selectedFile = selected;
			verifyFile();
		}
	}

	async function verifyFile() {
		if (selectedFile === undefined) return;
		state = States.VERIFYING_FILE;
		try {
			const sheets = (await ipc_invoke('start_examinee_import_process', {
				filePath: selectedFile
			})) as ExcelSheet[];
			if (sheets.length === 0) {
				invalidFileMessage = m.examinees_import_file_no_sheets();
				state = States.INVALID_FILE;
				return;
			}
			if (sheets.find((sheet) => !sheet.empty) === undefined) {
				invalidFileMessage = m.examinees_import_file_no_sheets_with_values();
				state = States.INVALID_FILE;
				return;
			}
			state = States.FILE_OK;
			dispatch('fileready', { selectedFile, sheets });
		} catch (e) {
			state = States.INVALID_FILE;
		}
	}

	export function getSelectedFile() {
		return selectedFile;
	}
</script>

<FileDropzone name="fileToImport" on:click={promptSelectFile} disabled={!canShooseFile}>
	<svelte:fragment slot="lead">
		<i class="fa-solid fa-file-arrow-up text-4xl" />
	</svelte:fragment>
	<svelte:fragment slot="message">
		{#if selectedFile === undefined}
			{m.select_file_drag_drop()}
		{:else}
			{selectedFile}
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="meta">
		{#if selectedFile === undefined}
			{m.examinees_import_file_allowed_formats()}
		{/if}
	</svelte:fragment>
</FileDropzone>

<div class={state === States.VERIFYING_FILE ? '' : 'hidden'}>
	<h3 class="text-2xl">{m.examinees_import_file_verifying()}</h3>
	<ProgressBar />
</div>

<div class={state === States.FILE_OK ? '' : 'hidden'}>
	<h3 class="text-2xl">{m.examinees_import_file_valid_file()}</h3>
</div>

<div class={state === States.INVALID_FILE ? '' : 'hidden'}>
	<h3 class="text-2xl">{m.examinees_import_file_invalid_file()}</h3>
	<h4 class="text-xl">
		{#if invalidFileMessage !== undefined}
			{invalidFileMessage}
		{:else}
			{m.examinees_import_file_could_not_check_file()}
		{/if}
	</h4>
</div>
