<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import * as m from '$paraglide/messages';

	$: route = i18n.route($page.url.pathname);
</script>

<AppRail>
	<!-- <svelte:fragment slot="lead">
		<AppRailAnchor href="/">
			<svelte:fragment slot="lead">
				<i class="fa-solid fa-bars text-2xl" />
			</svelte:fragment>
		</AppRailAnchor>
	</svelte:fragment> -->
	<AppRailAnchor href="/examinees" title="examinees" selected={route.startsWith('/examinees')}>
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-graduation-cap text-2xl" />
		</svelte:fragment>
		{m.navbar_examinees()}
	</AppRailAnchor>
	<svelte:fragment slot="trail">
		<AppRailAnchor href="/settings" title="settings" selected={route.startsWith('/settings')}>
			<svelte:fragment slot="lead">
				<i class="fa-solid fa-gear text-2xl" />
			</svelte:fragment>
			{m.navbar_settings()}
		</AppRailAnchor>
	</svelte:fragment>
</AppRail>
