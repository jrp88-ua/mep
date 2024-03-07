<script lang="ts">
	import '../app.postcss';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { AppShell, Toast } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import AppNavigationBar from './AppNavigationBar.svelte';
	import StatusBar from './StatusBar.svelte';

	initializeStores();
</script>

<ParaglideJS {i18n}>
	<Toast position={'br'} />
	<AppShell>
		<svelte:fragment slot="sidebarLeft">
			<AppNavigationBar />
		</svelte:fragment>
		<div class="m-4">
			<slot />
		</div>
		<svelte:fragment slot="footer">
			<StatusBar />
		</svelte:fragment>
	</AppShell>
</ParaglideJS>
