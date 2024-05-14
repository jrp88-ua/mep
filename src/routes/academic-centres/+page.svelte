<script lang="ts">
	import * as m from '$paraglide/messages';
	import { DataHandler } from '@vincjo/datatables';
	import ThSort from '$lib/datatable/ThSort.svelte';
	import ThFilter from '$lib/datatable/ThFilter.svelte';
	import Search from '$lib/datatable/Search.svelte';
	import RowsPerPage from '$lib/datatable/RowsPerPage.svelte';
	import RowCount from '$lib/datatable/RowCount.svelte';
	import Pagination from '$lib/datatable/Pagination.svelte';
	import { type AcademicCentre } from '$lib/models/academicCentres';
	import { deleteAcademicCentres, getAllAcademicCentres } from '$lib/services/academicCentres';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { get } from 'svelte/store';
	import type { ModelId } from '$lib/models/models';
	import { appState } from '$lib/models/appState';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore();
	const academicCentresStore = getAllAcademicCentres();

	let handler = new DataHandler<AcademicCentre>([], { rowsPerPage: 5 });
	$: handler.setRows($academicCentresStore);
	const rows = handler.getRows();

	const selected = handler.getSelected();
	$: disableDelete = $selected.length === 0;
	const isAllSelected = handler.isAllSelected();

	function deleteSelection() {
		if (disableDelete) return;
		modalStore.trigger({
			type: 'confirm',
			title: '¿Eliminar centros académicos seleccionados?',
			body: 'Si aceptas, se eliminarán los centros académicos seleccionados ({total} en total). <strong>Esta acción no se puede deshacer.</strong>',
			buttonTextConfirm: 'Eliminar centros seleccionados',
			buttonTextCancel: 'No eliminar centros seleccionados',
			response: (doDelete: boolean) => {
				if (!doDelete) return;
				const selectedIds = get(selected) as ModelId[];
				deleteAcademicCentres(selectedIds).forEach((deleted) => handler.select(deleted));
			}
		});
	}
</script>

<h1 class="text-3xl mb-4">{m.academic_centres_page_title()}</h1>
<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<div class="flex items-center gap-1">
			<!--<a href="/academic-centres/create" class="btn variant-filled-primary">
				<span><i class="fa-solid fa-plus" /></span>
				<span>{m.create_academic_centre()}</span>
			</a>-->
			<button disabled={disableDelete} on:click={deleteSelection} class="btn variant-filled-error">
				<span><i class="fa-solid fa-trash" /></span>
				<span>Borrar</span>
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
				<ThSort {handler} orderBy="name">{m.academic_centre_datatable_name()}</ThSort>
			</tr>
			<tr>
				<th class="selection" />
				<ThFilter {handler} filterBy="name" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row (row.id)}
				<tr
					on:click={(e) => {
						appState.setEdittingAcademicCentre(row.id);
						requestAnimationFrame(() => goto('/academic-centres/edit'));
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
					<td>{row.name}</td>
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
