<script lang="ts">
	import * as m from '$paraglide/messages';
	import '../app.postcss';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { AppShell, Toast, getToastStore } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import AppNavigationBar from './AppNavigationBar.svelte';
	import StatusBar from './StatusBar.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { appState } from '$lib/stores/appState';
	import { showWarningToast } from '$lib/toast';

	initializeStores();

	const toast = getToastStore();

	beforeNavigate((e) => {
		if (!appState.allowsNavigation()) {
			toast.trigger(
				showWarningToast({
					message: `
					<strong>${m.locked_navigation_title()}</strong><br>
					${appState.lockedNavigationReason() as string}
					`
				})
			);
			e.cancel();
		}
	});
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
