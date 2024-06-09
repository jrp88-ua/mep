<script lang="ts">
	import { ipc_invoke_result } from '$lib/ipc';
	import { appState } from '$lib/models/appState';
	import { makeSaveValuesObject } from '$lib/services/common';
	import * as m from '$paraglide/messages';

	async function saveAs() {
		console.log(
			await ipc_invoke_result('save_file', {
				values: makeSaveValuesObject(),
				file: 'D:\\test.mep',
				password: 'JUAN'
			})
		);

		console.log(
			await ipc_invoke_result('open_file', {
				file: 'D:\\test.mep',
				password: 'JUAN'
			})
		);
	}
</script>

<h1 class="text-3xl mb-4">{m.home_page_title()}</h1>

{#if $appState.openedFile === undefined}
	<a href="/open" class="btn variant-filled-primary">Abrir archivo</a>
{:else}
	<!-- else content here -->
{/if}
<button class="btn variant-filled" on:click={saveAs}>
	<span><i class="fa-solid fa-floppy-disk" /></span>
	Guardar como
</button>
