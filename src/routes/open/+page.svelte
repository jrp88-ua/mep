<script lang="ts">
	import * as m from '$paraglide/messages';
	import { open } from '@tauri-apps/api/dialog';
	import { FileDropzone } from '@skeletonlabs/skeleton';
	import { appState } from '$lib/models/appState';
	import { ipc_invoke_result } from '$lib/ipc';

	let selectedFile: string | undefined = undefined;
	let password: string = '';

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

		const result = await ipc_invoke_result('open_file', {
			file: selectedFile,
			password
		});
	}
</script>

<h1 class="text-3xl mb-4">{m.open_page_title()}</h1>
<form class="card p-4" on:submit|preventDefault={submitForm}>
	<div class="p-2">
		<span>{m.file()}</span>
		<FileDropzone name="file" on:click={promptSelectFile}>
			<svelte:fragment slot="lead"><i class="fa-solid fa-file-import text-4xl" /></svelte:fragment>
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
