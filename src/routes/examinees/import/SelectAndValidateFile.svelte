<script lang="ts">
	import { open } from '@tauri-apps/api/dialog';
	import { FileDropzone, ProgressBar } from '@skeletonlabs/skeleton';
	import { createEventDispatcher, onMount } from 'svelte';
	import { ipc_invoke } from '$lib/ipc';
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

	onMount(() => {
		if (selectedFile !== undefined) {
			state = States.FILE_OK;
		}
	});

	async function promptSelectFile(e: MouseEvent) {
		e.preventDefault();
		if (state !== States.WAITING_FOR_FILE) return;
		const selected = await open({
			multiple: false,
			filters: [
				{
					name: 'Hoja de cálculo',
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
			const sheets = await ipc_invoke('examinees_import_verify_file', {
				filePath: selectedFile
			});
			console.log(sheets);
			if (sheets.length === 0) {
				invalidFileMessage = 'No hay hojas en el archivo seleccioando';
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

<FileDropzone
	name="fileToImport"
	on:click={promptSelectFile}
	disabled={state !== States.WAITING_FOR_FILE && state !== States.INVALID_FILE}
>
	<svelte:fragment slot="lead">
		<i class="fa-solid fa-file-arrow-up text-4xl" />
	</svelte:fragment>
	<svelte:fragment slot="message">
		{#if selectedFile === undefined}
			Elije un archivo o arrastra y suelta
		{:else}
			{selectedFile}
		{/if}
	</svelte:fragment>
	<svelte:fragment slot="meta">
		{#if selectedFile === undefined}
			Se permiten los formatos xls, xlsx, xlsm, xlsb, xla, xlam y ods
		{/if}
	</svelte:fragment>
</FileDropzone>

<div class={state === States.VERIFYING_FILE ? '' : 'hidden'}>
	<h3 class="text-2xl">Verificando archivo</h3>
	<ProgressBar />
</div>

<div class={state === States.FILE_OK ? '' : 'hidden'}>
	<h3 class="text-2xl">Archivo correcto</h3>
</div>

<div class={state === States.INVALID_FILE ? '' : 'hidden'}>
	<h3 class="text-2xl">Archivo inválido</h3>
	<h4 class="text-xl">
		{#if invalidFileMessage !== undefined}
			{invalidFileMessage}
		{:else}
			No se ha podido comprobar este archivo, vuelve a intentarlo o elige otro
		{/if}
	</h4>
</div>
