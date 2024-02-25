<script lang="ts">
	import * as m from '$paraglide/messages';
	import { store } from '$lib/stores/examinees';
	import { DataHandler } from '@vincjo/datatables';
	import ThSort from '$lib/datatable/ThSort.svelte';
	import ThFilter from '$lib/datatable/ThFilter.svelte';
	import Search from '$lib/datatable/Search.svelte';
	import RowsPerPage from '$lib/datatable/RowsPerPage.svelte';
	import RowCount from '$lib/datatable/RowCount.svelte';
	import Pagination from '$lib/datatable/Pagination.svelte';
	import type { Examinee } from '../../types/Examinee';

	const getExaminees = store.getExaminees().then((examinees) => {
		handler.setRows(examinees);
	});

	let handler = new DataHandler<Examinee>([], { rowsPerPage: 5 });
	const rows = handler.getRows();
</script>

<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<Search {handler} />
		<RowsPerPage {handler} />
	</header>
	<!-- Table -->
	<table class="table table-hover table-compact w-full table-auto">
		<thead>
			<tr>
				<ThSort {handler} orderBy="name">{m.examenees_datatable_name()}</ThSort>
				<ThSort {handler} orderBy="surenames">{m.examenees_datatable_surenames()}</ThSort>
				<ThSort {handler} orderBy="origin">{m.examenees_datatable_origin()}</ThSort>
				<ThSort {handler} orderBy="court">{m.examenees_datatable_court()}</ThSort>
			</tr>
			<tr>
				<ThFilter {handler} filterBy="name" />
				<ThFilter {handler} filterBy="surenames" />
				<ThFilter {handler} filterBy="origin" />
				<ThFilter {handler} filterBy="court" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row}
				<tr>
					<td>{row.name}</td>
					<td>{row.surenames}</td>
					<td>{row.origin}</td>
					<td>{row.court}</td>
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
