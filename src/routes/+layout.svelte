<script lang="ts">
	import { Settings } from 'luxon';

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
	import { info } from 'tauri-plugin-log-api';
	import WarningsDisplay from './WarningsDisplay.svelte';

	Settings.throwOnInvalid = true;
	initializeStores();

	const toastStore = getToastStore();

	beforeNavigate((e) => {
		if (!appState.allowsNavigation()) {
			showWarningToast(toastStore, {
				title: m.locked_navigation_title(),
				message: appState.lockedNavigationReason() as string
			});
			e.cancel();
		} else {
			info('Navigating to ' + e.to?.route.id + ' from ' + e.from?.route.id);
		}
	});
</script>

<ParaglideJS {i18n}>
	<Toast position={'br'} />
	<Modal />
	<AppDrawers />
	<AppShell>
		<svelte:fragment slot="pageHeader">
			<WarningsDisplay />
		</svelte:fragment>
		<svelte:fragment slot="sidebarLeft">
			<AppNavigationBar />
		</svelte:fragment>
		<div class="m-4">
			<slot />
		</div>
	</AppShell>
</ParaglideJS>
