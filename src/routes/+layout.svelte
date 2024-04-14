<script lang="ts">
	import * as m from '$paraglide/messages';
	import '../app.postcss';
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-js-adapter-sveltekit';
	import { AppShell, Modal, Toast, getToastStore } from '@skeletonlabs/skeleton';
	import { initializeStores } from '@skeletonlabs/skeleton';
	import AppNavigationBar from './AppNavigationBar.svelte';
	import { beforeNavigate } from '$app/navigation';
	import { appState } from '$lib/models/appState';
	import { showWarningToast } from '$lib/toast';
	import AppDrawers from '$lib/drawer/AppDrawers.svelte';

	initializeStores();

	const toast = getToastStore();

	beforeNavigate((e) => {
		if (!appState.allowsNavigation()) {
			toast.trigger(
				showWarningToast({
					title: m.locked_navigation_title(),
					message: appState.lockedNavigationReason() as string
				})
			);
			e.cancel();
		}
	});
</script>

<ParaglideJS {i18n}>
	<Toast position={'br'} />
	<Modal />
	<AppDrawers />
	<AppShell>
		<svelte:fragment slot="sidebarLeft">
			<AppNavigationBar />
		</svelte:fragment>
		<div class="m-4">
			<slot />
		</div>
	</AppShell>
</ParaglideJS>
