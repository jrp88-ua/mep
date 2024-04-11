<script lang="ts">
	import * as m from '$paraglide/messages';
	import { DataHandler } from '@vincjo/datatables';
	import ThSort from '$lib/datatable/ThSort.svelte';
	import ThFilter from '$lib/datatable/ThFilter.svelte';
	import Search from '$lib/datatable/Search.svelte';
	import RowsPerPage from '$lib/datatable/RowsPerPage.svelte';
	import RowCount from '$lib/datatable/RowCount.svelte';
	import Pagination from '$lib/datatable/Pagination.svelte';
	import ThEnumFilter from '$lib/datatable/ThEnumFilter.svelte';
	import { getAllVigilants, vigilantRoleValuesTranslate } from '$lib/services/vigilant';
	import { VIGILANT_ROLE_VALUES, type Vigilant } from '$lib/models/vigilant';
	import { getDrawerStore } from '@skeletonlabs/skeleton';

	const vigilantsStore = getAllVigilants();

	let handler = new DataHandler<Vigilant>([], { rowsPerPage: 5 });
	handler.setRows($vigilantsStore);
	const rows = handler.getRows();

	const t = vigilantRoleValuesTranslate as (v: string) => string;

	const drawerStore = getDrawerStore();
</script>

<h1 class="text-3xl mb-4">{m.vigilants_page_title()}</h1>
<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<div class="flex items-center gap-1">
			<a href="/vigilants/create" class="btn variant-filled-primary">
				<span><i class="fa-solid fa-plus" /></span>
				<span>{m.create_vigilant()}</span>
			</a>
		</div>
		<div class="flex gap-4">
			<Search {handler} />
			<RowsPerPage {handler} />
		</div>
	</header>
	<!-- Table -->
	<table class="table table-hover table-compact w-full table-auto">
		<thead>
			<tr>
				<ThSort {handler} orderBy="name">{m.vigilant_datatable_name()}</ThSort>
				<ThSort {handler} orderBy="surenames">{m.vigilant_datatable_surenames()}</ThSort>
				<ThSort {handler} orderBy="role">{m.vigilant_datatable_role()}</ThSort>
				<ThSort {handler} orderBy="lazySpecialtyName">{m.vigilant_datatable_specialty()}</ThSort>
				<ThSort {handler} orderBy="lazyAcademicCentreName">
					{m.vigilant_datatable_academic_centre()}
				</ThSort>
				<ThSort {handler} orderBy="mainCourt">{m.vigilant_datatable_main_court()}</ThSort>
			</tr>
			<tr>
				<ThFilter {handler} filterBy="name" />
				<ThFilter {handler} filterBy="surenames" />
				<ThEnumFilter {handler} values={VIGILANT_ROLE_VALUES} valueTranslator={t} filterBy="role" />
				<ThFilter {handler} filterBy="lazySpecialtyName" />
				<ThFilter {handler} filterBy="lazyAcademicCentreName" />
				<ThFilter {handler} filterBy="mainCourt" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row (row.id)}
				<tr
					on:click={(event) => {
						const target = event.target;
						if (target instanceof HTMLInputElement) return;
						drawerStore.open({
							id: 'edit-vigilant',
							meta: row.id
						});
					}}
				>
					<td>{row.name}</td>
					<id>{row.surenames}</id>
					<id>{t(row.role)}</id>
					<id>{row.lazySpecialtyName}</id>
					<id>{row.lazyAcademicCentreName}</id>
					<id>{row.mainCourt}</id>
				</tr>
			{/each}
		</tbody>
	</table>
	<!-- Footer -->
	<footer class="flex justify-between">
		<RowCount {handler} />
		<Pagination {handler} />
	</footer>
</div>
