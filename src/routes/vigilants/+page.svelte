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
	import {
		deleteVigilants,
		getAllVigilants,
		vigilantRoleValuesTranslate
	} from '$lib/services/vigilant';
	import { VIGILANT_ROLE_VALUES, type Vigilant } from '$lib/models/vigilant';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { get } from 'svelte/store';
	import type { ModelId } from '$lib/models/models';
	import { appState } from '$lib/models/appState';
	import { goto } from '$app/navigation';

	const modalStore = getModalStore();
	const vigilantsStore = getAllVigilants();

	let handler = new DataHandler<Vigilant>([], { rowsPerPage: 5 });
	$: handler.setRows($vigilantsStore);
	const rows = handler.getRows();

	const selected = handler.getSelected();
	$: disableDelete = $selected.length === 0;
	const isAllSelected = handler.isAllSelected();

	function deleteSelection() {
		if (disableDelete) return;
		modalStore.trigger({
			type: 'confirm',
			title: '¿Eliminar vigilantes seleccionados?',
			body: 'Si aceptas, se eliminarán los vigilantes seleccionados ({total} en total). <strong>Esta acción no se puede deshacer.</strong>',
			buttonTextConfirm: 'Eliminar vigilantes',
			buttonTextCancel: 'No eliminar vigilantes',
			response: (doDelete: boolean) => {
				if (!doDelete) return;
				const selectedIds = get(selected) as ModelId[];
				deleteVigilants(selectedIds).forEach((deleted) => handler.select(deleted));
			}
		});
	}

	const t = vigilantRoleValuesTranslate as (v: string) => string;
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
				<ThSort {handler} orderBy="name">{m.vigilant_datatable_name()}</ThSort>
				<ThSort {handler} orderBy="surenames">{m.vigilant_datatable_surenames()}</ThSort>
				<ThSort {handler} orderBy="role">{m.vigilant_datatable_role()}</ThSort>
				<ThSort {handler} orderBy="lazySpecialtiesNames">{m.vigilant_datatable_specialty()}</ThSort>
				<ThSort {handler} orderBy="lazyAcademicCentreName">
					{m.vigilant_datatable_academic_centre()}
				</ThSort>
				<ThSort {handler} orderBy="mainCourt">{m.vigilant_datatable_main_court()}</ThSort>
			</tr>
			<tr>
				<th class="selection" />
				<ThFilter {handler} filterBy="name" />
				<ThFilter {handler} filterBy="surenames" />
				<ThEnumFilter {handler} values={VIGILANT_ROLE_VALUES} valueTranslator={t} filterBy="role" />
				<ThFilter {handler} filterBy="lazySpecialtiesNames" />
				<ThFilter {handler} filterBy="lazyAcademicCentreName" />
				<ThFilter {handler} filterBy="mainCourt" />
			</tr>
		</thead>
		<tbody>
			{#each $rows as row (row.id)}
				<tr
					on:click={(e) => {
						const target = e.target;
						if (!(target instanceof HTMLElement)) return;
						if (
							target.getAttribute('data-row') === 'academic-centre' &&
							row.academicCentreId !== undefined
						) {
							appState.setEdittingAcademicCentre(row.academicCentreId);
							requestAnimationFrame(() => goto('/academic-centres/edit'));
						} else {
							appState.setEdittingVigilant(row.id);
							requestAnimationFrame(() => goto('/vigilants/edit'));
						}
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
					<td>{row.surenames}</td>
					<td>{t(row.role)}</td>
					<td>
						<ul>
							{#each row.getSpecialties() as specialty}
								<li>{specialty.name}</li>
							{/each}
						</ul>
					</td>
					<td data-row="academic-centre">
						{#if row.getAcademicCentre() === undefined}
							<i>{m.no_academic_centre()}</i>
						{:else}
							{row.lazyAcademicCentreName}
						{/if}
					</td>
					<td>{row.mainCourt}</td>
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
