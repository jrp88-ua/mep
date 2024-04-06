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
	import { Subject, SUBJECT_KIND_VALUES, subjectsStore } from '$lib/models/subjects';
	import { subjectKindValuesTranslate } from '$lib/services/subjects';

	let handler = new DataHandler<Subject>([], { rowsPerPage: 5 });
	handler.setRows(subjectsStore.getAllInstances());
	const rows = handler.getRows();

	const t = subjectKindValuesTranslate as (v: string) => string;
</script>

<h1 class="text-3xl mb-4">{m.subjects_page_title()}</h1>
<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<div class="flex items-center gap-1">
			<!--<a href="/subjects/create" class="btn variant-filled-primary">
				<span><i class="fa-solid fa-plus" /></span>
				<span>Crear</span>
			</a>-->
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
				<ThSort {handler} orderBy="name">{m.subject_datatable_name()}</ThSort>
				<ThSort {handler} orderBy="kind">{m.subject_datatable_kind()}</ThSort>
			</tr>
			<tr>
				<ThFilter {handler} filterBy="name" />
				<ThEnumFilter {handler} values={SUBJECT_KIND_VALUES} valueTranslator={t} filterBy="kind" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row}
				<tr>
					<td>{row.name}</td>
					<td>{t(row.kind)}</td>
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
