<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { AppRail, AppRailAnchor } from '@skeletonlabs/skeleton';
	import * as m from '$paraglide/messages';

	$: route = i18n.route($page.url.pathname);
</script>

<AppRail>
	<AppRailAnchor href="/examinees" title="examinees" selected={route.startsWith('/examinees')}>
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-graduation-cap text-2xl" />
		</svelte:fragment>
		{m.navbar_examinees()}
	</AppRailAnchor>
	<AppRailAnchor href="/vigilants" title="vigilants" selected={route.startsWith('/vigilants')}>
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-binoculars text-2xl" />
		</svelte:fragment>
		{m.navbar_vigilants()}
	</AppRailAnchor>
	<AppRailAnchor
		href="/academic-centres"
		title="academic-centres"
		selected={route.startsWith('/academic-centres')}
	>
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-school text-2xl" />
		</svelte:fragment>
		{m.navbar_academic_centre()}
	</AppRailAnchor>
	<AppRailAnchor href="/subjects" title="subjects" selected={route.startsWith('/subjects')}>
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-book text-2xl" />
		</svelte:fragment>
		{m.navbar_subjects()}
	</AppRailAnchor>
	<AppRailAnchor href="/classrooms" title="classrooms" selected={route.startsWith('/classrooms')}>
		<svelte:fragment slot="lead">
			<i class="fa-solid fa-chair text-2xl" />
		</svelte:fragment>
		{m.navbar_classrooms()}
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
