<script lang="ts">
	import { ipc_invoke_result } from '$lib/ipc';
	import { showErrorToast } from '$lib/toast';
	import type { OpenFileError } from '$lib/types/generated/OpenFileError';
	import * as m from '$paraglide/messages';
	import { languageTag } from '$paraglide/runtime';
	import { getToastStore, RadioGroup, RadioItem } from '@skeletonlabs/skeleton';
	import { appLogDir } from '@tauri-apps/api/path';

	const toastStore = getToastStore();

	let selectedLanguage = languageTag();

	async function openLogs() {
		const path = await appLogDir();
		const result = await ipc_invoke_result<void, OpenFileError>('open_file', { path });
		if (!result.success) {
			const title = m.could_not_open_logs_title();
			let message;
			switch (result.error!.type) {
				case 'io':
					message = m.could_not_open_logs_io();
					break;
				case 'internal':
					message = m.could_not_open_logs_unexpected();
					break;
				case 'status':
					message = m.could_not_open_logs_status();
					break;
			}
			showErrorToast(toastStore, { title, message });
		}
	}
</script>

<h1 class="text-3xl mb-4">{m.settings_page_title()}</h1>
<h2 class="text-xl">{m.settings_language()}</h2>
<RadioGroup>
	<a href="/settings" hreflang="es-ES">
		<RadioItem bind:group={selectedLanguage} name="appLanguage" value={'es-ES'}>Español</RadioItem>
	</a>
	<a href="/settings" hreflang="en">
		<RadioItem bind:group={selectedLanguage} name="appLanguage" value={'en'}>English</RadioItem>
	</a>
</RadioGroup>
<p>
	<button class="btn variant-filled-secondary mt-4" on:click={openLogs}>
		{m.open_logs_folder()}
	</button>
</p>
