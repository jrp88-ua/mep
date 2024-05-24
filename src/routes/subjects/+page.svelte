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
	import { SUBJECT_KIND_VALUES, Subject } from '$lib/models/subjects';
	import {
		deleteSubjects,
		getAllSubjects,
		subjectKindValuesTranslate
	} from '$lib/services/subjects';

	import { appState } from '$lib/models/appState';
	import { languageTag } from '$paraglide/runtime';
	import { getModalStore } from '@skeletonlabs/skeleton';
	import { get } from 'svelte/store';
	import type { ModelId } from '$lib/models/models';
	import { routeTo } from '$lib/util';

	const modalStore = getModalStore();
	const subjectsStore = getAllSubjects();

	let handler = new DataHandler<Subject>([], { rowsPerPage: 5 });
	$: handler.setRows($subjectsStore);
	const rows = handler.getRows();

	const selected = handler.getSelected();
	$: disableDelete = $selected.length === 0;
	const isAllSelected = handler.isAllSelected();

	function deleteSelection() {
		if (disableDelete) return;
		modalStore.trigger({
			type: 'confirm',
			title: '¿Eliminar asignaturas seleccionadas?',
			body: 'Si aceptas, se eliminarán las asignaturas seleccionadas ({total} en total). <strong>Esta acción no se puede deshacer.</strong>',
			buttonTextConfirm: 'Eliminar asignaturas',
			buttonTextCancel: 'No eliminar asignaturas',
			response: (doDelete: boolean) => {
				if (!doDelete) return;
				const selectedIds = get(selected) as ModelId[];
				deleteSubjects(selectedIds).forEach((deleted) => handler.select(deleted));
			}
		});
	}

	const t = subjectKindValuesTranslate as (v: string) => string;
</script>

<h1 class="text-3xl mb-4">{m.subjects_page_title()}</h1>
<div class=" overflow-x-auto space-y-4">
	<!-- Header -->
	<header class="flex justify-between gap-4">
		<div class="flex items-center gap-1">
			<a href="/subjects/create" class="btn variant-filled-primary">
				<span><i class="fa-solid fa-plus" /></span>
				<span>Crear</span>
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
				<ThSort {handler} orderBy="name">{m.subject_datatable_name()}</ThSort>
				<ThSort {handler} orderBy="kind">{m.subject_datatable_kind()}</ThSort>
				<ThSort {handler} orderBy="examDate">{m.subject_datatable_exam_date()}</ThSort>
				<ThSort {handler} orderBy="examDuration">{m.subject_datatable_exam_duration()}</ThSort>
			</tr>
			<tr>
				<th class="selection" />
				<ThFilter {handler} filterBy="name" />
				<ThEnumFilter {handler} values={SUBJECT_KIND_VALUES} valueTranslator={t} filterBy="kind" />
				<th>{m.can_not_filter()}</th>
				<th>{m.can_not_filter()}</th>
			</tr>
		</thead>
		<tbody>
			{#each $rows as row (row.id)}
				<tr
					on:click={() => {
						appState.setEdittingSubject(row.id);
						routeTo('/subjects/edit');
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
					<td>{t(row.kind)}</td>
					<td>
						{#if row.examStartDate === undefined}
							<i>{m.no_date()}</i>
						{:else}
							{row.examStartDate.toLocaleString(
								{ dateStyle: 'full', timeStyle: 'short' },
								{ locale: languageTag() }
							)}
						{/if}
					</td>
					<td>
						{#if row.examDuration !== undefined}
							{row.examDuration.toFormat("h'h' m'm' ")}
						{/if}
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
