<script lang="ts">
	import * as m from '$paraglide/messages';
	import { DataHandler } from '@vincjo/datatables';
	import ThSort from '$lib/datatable/ThSort.svelte';
	import ThFilter from '$lib/datatable/ThFilter.svelte';
	import Search from '$lib/datatable/Search.svelte';
	import RowsPerPage from '$lib/datatable/RowsPerPage.svelte';
	import RowCount from '$lib/datatable/RowCount.svelte';
	import Pagination from '$lib/datatable/Pagination.svelte';
	import { deleteClassrooms, getAllClassrooms } from '$lib/services/classroom';
	import type { Classroom } from '$lib/models/classroom';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { get } from 'svelte/store';
	import type { ModelId } from '$lib/models/models';
	import { appState } from '$lib/models/appState';

	import { routeTo } from '$lib/util';
	import { showActionWillDeleteAssignment } from '../actionWillDeleteAssignment';

	const modalStore = getModalStore();
	const classroomStore = getAllClassrooms();

	let handler = new DataHandler<Classroom>([], { rowsPerPage: 5 });
	$: handler.setRows($classroomStore);
	const rows = handler.getRows();

	const selected = handler.getSelected();
	$: disableDelete = $selected.length === 0;
	const isAllSelected = handler.isAllSelected();

	async function deleteSelection() {
		if (disableDelete) return;
		if (!(await showActionWillDeleteAssignment(modalStore))) return;
		modalStore.trigger({
			type: 'confirm',
			title: m.delete_classroom_modal_title(),
			body: m.delete_classroom_modal_body({ total: get(selected).length }),
			buttonTextConfirm: m.confirm_delete_selected_classrooms(),
			buttonTextCancel: m.cancel_delete_selected_classrooms(),
			response: (doDelete: boolean) => {
				if (!doDelete) return;
				const selectedIds = get(selected) as ModelId[];
				deleteClassrooms(selectedIds).forEach((deleted) => handler.select(deleted));
			}
		});
	}
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
			<button disabled={disableDelete} on:click={deleteSelection} class="btn variant-filled-error">
				<span><i class="fa-solid fa-trash" /></span>
				<span>{m.deletem()}</span>
			</button>
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
				<th class="selection">
					<input
						type="checkbox"
						on:click={() => handler.selectAll({ selectBy: 'id' })}
						checked={$isAllSelected}
					/>
				</th>
				<ThSort {handler} orderBy="code">{m.classroom_datatable_code()}</ThSort>
				<ThSort {handler} orderBy="locationCode">{m.classroom_datatable_location_code()}</ThSort>
				<ThSort {handler} orderBy="totalCapacity">{m.classroom_datatable_total_capacity()}</ThSort>
				<ThSort {handler} orderBy="examCapacity">{m.classroom_datatable_exam_capacity()}</ThSort>
				<ThSort {handler} orderBy="priority">{m.classroom_datatable_priority()}</ThSort>
				<ThSort {handler} orderBy="courtLocation">{m.classroom_datatable_court_location()}</ThSort>
				<ThSort {handler} orderBy="kind">{m.classroom_datatable_kind()}</ThSort>
				<ThSort {handler} orderBy="notes">{m.classroom_datatable_notes()}</ThSort>
			</tr>
			<tr>
				<th class="selection" />
				<ThFilter {handler} filterBy="code" />
				<ThFilter {handler} filterBy="locationCode" />
				<ThFilter {handler} filterBy="totalCapacity" />
				<ThFilter {handler} filterBy="examCapacity" />
				<ThFilter {handler} filterBy="priority" />
				<ThFilter {handler} filterBy="courtLocation" />
				<ThFilter {handler} filterBy="kind" />
				<ThFilter {handler} filterBy="notes" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row (row.id)}
				<tr
					on:click={(e) => {
						appState.setEdittingClassroom(row.id);
						routeTo('/classrooms/edit');
					}}
				>
					<td class="selection">
						<input
							type="checkbox"
							on:click={(e) => {
								e.stopImmediatePropagation();
								handler.select(row.id);
							}}
							checked={$selected.includes(row.id)}
						/>
					</td>
					<td>{row.code}</td>
					<td>{row.locationCode}</td>
					<td>{row.totalCapacity}</td>
					<td>{row.examCapacity} </td>
					<td>{row.priority}</td>
					<td>
						{#if row.courtLocation === undefined}
							<td />
						{:else}
							{row.courtLocation}
						{/if}
					</td>
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
