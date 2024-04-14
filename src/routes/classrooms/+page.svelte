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
	import { getDrawerStore } from '@skeletonlabs/skeleton';
	import { getAllClassrooms } from '$lib/services/classroom';
	import type { Classroom } from '$lib/models/classroom';

	const classroomStore = getAllClassrooms();

	let handler = new DataHandler<Classroom>([], { rowsPerPage: 5 });
	handler.setRows($classroomStore);
	const rows = handler.getRows();

	const drawerStore = getDrawerStore();
</script>

<h1 class="text-3xl mb-4">{m.classrooms_page_title()}</h1>
<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<div class="flex items-center gap-1">
			<a href="/classrooms/create" class="btn variant-filled-primary">
				<span><i class="fa-solid fa-plus" /></span>
				<span>{m.create_classroom()}</span>
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
				<ThSort {handler} orderBy="code">{m.classroom_datatable_code()}</ThSort>
				<ThSort {handler} orderBy="locationCode">{m.classroom_datatable_location_code()}</ThSort>
				<ThSort {handler} orderBy="totalCapacity">{m.classroom_datatable_total_capacity()}</ThSort>
				<ThSort {handler} orderBy="examCapacity">{m.classroom_datatable_exam_capacity()}</ThSort>
				<ThSort {handler} orderBy="kind">{m.classroom_datatable_kind()}</ThSort>
				<ThSort {handler} orderBy="notes">{m.classroom_datatable_notes()}</ThSort>
			</tr>
			<tr>
				<ThFilter {handler} filterBy="code" />
				<ThFilter {handler} filterBy="locationCode" />
				<ThFilter {handler} filterBy="totalCapacity" />
				<ThFilter {handler} filterBy="examCapacity" />
				<ThFilter {handler} filterBy="kind" />
				<ThFilter {handler} filterBy="notes" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row (row.id)}
				<tr
					on:click={(event) => {
						const target = event.target;
						if (target instanceof HTMLInputElement) return;
						drawerStore.open({
							id: 'edit-classroom',
							meta: row.id
						});
					}}
				>
					<td>{row.code}</td>
					<td>{row.locationCode}</td>
					<td>{row.totalCapacity}</td>
					<td>{row.examCapacity} </td>
					<td>{row.kind}</td>
					<td>
						{#each row.notes as note}
							<p>{note}</p>
						{/each}
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
