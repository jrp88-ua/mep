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
	import { info, warn } from 'tauri-plugin-log-api';
	import WarningsDisplay from './WarningsDisplay.svelte';
	import { appWindow } from '@tauri-apps/api/window';
	import { routeTo } from '$lib/util';
	import { ipc_invoke } from '$lib/ipc';
	import { confirm } from '@tauri-apps/api/dialog';

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

	// https://github.com/tauri-apps/tauri/discussions/3844
	document.addEventListener('keydown', function (event) {
		// Prevent F5 or Ctrl+R (Windows/Linux) and Command+R (Mac) from refreshing the page
		if (
			event.key === 'F5' ||
			(event.ctrlKey && event.key === 'r') ||
			(event.metaKey && event.key === 'r')
		) {
			event.preventDefault();
		}
	});

	document.addEventListener('contextmenu', function (event) {
		event.preventDefault();
	});

	appWindow.onCloseRequested(async (event) => {
		if (!appState.allowsNavigation()) {
			showWarningToast(toastStore, {
				title: m.cannot_close_operation_in_progress(),
				message: appState.lockedNavigationReason()!
			});
			event.preventDefault();
			return;
		}

		if (appState.isFileSaved()) return;
		const confirmed = await confirm(m.close_without_saving_message(), {
			title: m.close_without_saving_title(),
			type: 'warning'
		});
		if (!confirmed) event.preventDefault();
	});

	ipc_invoke<string[]>('open_file_from_open_with').then((args) => {
		if (args.length > 1) {
			const file = args[1];
			if (typeof file !== 'string') {
				warn("Called event 'open-file' without specifying a valid file");
				return;
			}
			appState.setOpeningFile(file);
			routeTo('/open');
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
