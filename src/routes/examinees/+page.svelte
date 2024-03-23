<script lang="ts">
	import * as m from '$paraglide/messages';
	import { DataHandler } from '@vincjo/datatables';
	import ThSort from '$lib/datatable/ThSort.svelte';
	import ThFilter from '$lib/datatable/ThFilter.svelte';
	import Search from '$lib/datatable/Search.svelte';
	import RowsPerPage from '$lib/datatable/RowsPerPage.svelte';
	import RowCount from '$lib/datatable/RowCount.svelte';
	import Pagination from '$lib/datatable/Pagination.svelte';
	import type { Examinee } from '$lib/types/models';
	import { examineesStore } from '$lib/stores/models';

	const getExaminees = examineesStore.getAllInstances().then((examinees) => {
		examinees.forEach((examinee) => examinee.getAcademicCentre());
		handler.setRows(examinees);
	});

	let handler = new DataHandler<Examinee>([], { rowsPerPage: 5 });
	const rows = handler.getRows();
</script>

<h1 class="text-3xl mb-4">{m.examinees_page_title()}</h1>
<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<div class="flex items-center gap-1">
			<a href="/examinees/create" class="btn variant-filled-primary">
				<span><i class="fa-solid fa-plus" /></span>
				<span>{m.create_examinee()}</span>
			</a>
			<div class="btn-group variant-filled-secondary">
				<a href="/examinees/import">
					<span><i class="fa-solid fa-file-export" /></span>
					<span>{m.import_examinees()}</span>
				</a>
				<!-- <button on:click={() => alert('Aún no se ha implementado')}>
					<span><i class="fa-solid fa-file-import" /></span>
					<span>{m.export_examinees()}</span>
				</button> -->
			</div>
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
				<ThSort {handler} orderBy="name">{m.examenees_datatable_name()}</ThSort>
				<ThSort {handler} orderBy="surenames">{m.examenees_datatable_surenames()}</ThSort>
				<ThSort {handler} orderBy="origin">{m.examenees_datatable_origin()}</ThSort>
				<ThSort {handler} orderBy="court">{m.examenees_datatable_court()}</ThSort>
				<ThSort {handler} orderBy="court">{m.examenees_datatable_academic_centre()}</ThSort>
			</tr>
			<tr>
				<ThFilter {handler} filterBy="name" />
				<ThFilter {handler} filterBy="surenames" />
				<ThFilter {handler} filterBy="origin" />
				<ThFilter {handler} filterBy="court" />
				<ThFilter {handler} filterBy="lazyAcademicCentreName" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row}
				<tr>
					<td>{row.name}</td>
					<td>{row.surenames}</td>
					<td>{row.origin}</td>
					<td>{row.court}</td>
					<td>
						{#await row.getAcademicCentre()}
							Loading
						{:then centre}
							{centre?.name}
						{/await}
					</td>
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
