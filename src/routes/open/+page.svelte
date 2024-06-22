<script lang="ts">
	import * as m from '$paraglide/messages';
	import { open } from '@tauri-apps/api/dialog';
	import { FileDropzone, ProgressRadial, getToastStore } from '@skeletonlabs/skeleton';
	import { appState } from '$lib/models/appState';
	import { ipc_invoke_result } from '$lib/ipc';
	import { onMount } from 'svelte';
	import type { AppValues } from '$lib/types/generated/AppValues';
	import type { ReadFromFileError } from '$lib/types/generated/ReadFromFileError';
	import { useSavedValuesObject } from '$lib/services/common';
	import { showErrorToast, showSuccessToast, type CustomToastSettings } from '$lib/toast';
	import { setFileIsSaved, setOpenedFile } from '$lib/services/appState';
	import { routeTo } from '$lib/util';

	const toast = getToastStore();

	let selectedFile: string | undefined = undefined;
	let password: string = '';

	let openingFile = false;

	onMount(() => {
		const file = appState.getOpeningFile();
		if (file !== undefined) selectedFile = file;
		appState.setOpeningFile(undefined);
	});

	async function promptSelectFile(e: MouseEvent) {
		e.preventDefault();

		const selected = await open({
			multiple: false,
			filters: [
				{
					name: 'MEP',
					extensions: ['mep']
				}
			]
		});

		if (selected === null || Array.isArray(selected)) return;
		selectedFile = selected;
	}

	async function submitForm(e: SubmitEvent) {
		if (selectedFile === undefined || password === '') return;
		appState.lockNavigation(m.opening_file());

		openingFile = true;
		const result = await ipc_invoke_result<AppValues, ReadFromFileError>('open_file', {
			file: selectedFile,
			password
		});
		if (result.success) {
			const values = result.value;
			useSavedValuesObject(values);
			setFileIsSaved(true);
			setOpenedFile({ file: selectedFile, password });
			showSuccessToast(toast, {
				message: m.file_opened()
			});
			appState.unlockNavigation();
			routeTo('/');
		} else {
			const title = m.could_not_open_file_title();
			switch (result.error.type) {
				case 'reading':
					showErrorToast(toast, {
						title,
						message: m.could_not_open_file_message_open_file_reading()
					});
					break;
				case 'invalid':
					switch (result.error.part.type) {
						case 'password':
							showErrorToast(toast, {
								title,
								message: m.could_not_open_file_message_open_file_invalid_password()
							});
							break;
						case 'header':
							showErrorToast(toast, {
								title,
								message: m.could_not_open_file_message_open_file_invalid_header()
							});
							break;
						case 'version':
							showErrorToast(toast, {
								title,
								message: m.could_not_open_file_message_open_file_invalid_version()
							});
							break;
					}
					break;
				case 'keyDerivation':
				case 'createCipher':
				case 'passwordCheck':
					showErrorToast(toast, {
						title,
						message: m.could_not_open_file_message_open_file_internal_error()
					});
					break;
				case 'openFile':
					switch (result.error.case.type) {
						case 'notFound':
							showErrorToast(toast, {
								title,
								message: m.could_not_open_file_message_open_file_not_found()
							});
							break;
						case 'permissions':
							showErrorToast(toast, {
								title,
								message: m.could_not_open_file_message_open_file_permissions()
							});
							break;
						case 'other':
							showErrorToast(toast, {
								title,
								message: m.could_not_open_file_message_open_file_other()
							});
							break;
					}
					break;
				case 'serialization':
					showErrorToast(toast, {
						title,
						message: m.could_not_open_file_message_serialization()
					});
					break;
			}
			appState.unlockNavigation();
		}

		openingFile = false;
	}
</script>

<h1 class="text-3xl mb-4">{m.open_page_title()}</h1>
{#if openingFile}
	<div class=" flex flex-col items-center">
		<h2 class="text-2xl mb-5">{m.opening_file()}</h2>
		<ProgressRadial />
	</div>
{:else}
	<form class="card p-4" on:submit|preventDefault={submitForm}>
		<div class="p-2">
			<span>{m.file()}</span>
			<FileDropzone name="file" on:click={promptSelectFile}>
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
				required
			/>
		</label>
		<div class="card-footer">
			<button
				type="submit"
				class="btn variant-filled-primary"
				disabled={password === '' || selectedFile === undefined}
			>
				<i class="fa-solid fa-file-import" />
				<span>{m.open()}</span>
			</button>
			<a href="/" class="btn variant-filled-tertiary">
				<i class="fa-solid fa-xmark" />
				<span>{m.cancel()}</span>
			</a>
		</div>
	</form>
{/if}
