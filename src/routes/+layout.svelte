<script lang="ts">
	import '../app.postcss';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { AppShell } from '@skeletonlabs/skeleton';
	import AppNavigationBar from './AppNavigationBar.svelte';
</script>

<ParaglideJS {i18n}>
	<AppShell>
		<svelte:fragment slot="sidebarLeft">
			<AppNavigationBar />
		</svelte:fragment>
		<div class="m-4">
			<slot />
		</div>
	</AppShell>
</ParaglideJS>
