<script lang="ts">
	import * as m from '$paraglide/messages';

	import type { ExamineeImportSettings } from '$lib/types/generated/ExamineeImportSettings';
	import type { ExcelSheet } from '$lib/types/generated/ExcelSheet';
	import { createSheetColumns } from '$lib/util';
	import { createEventDispatcher, onMount } from 'svelte';

	export let sheet: ExcelSheet | undefined;
	export let importSettings: ExamineeImportSettings;

	let columnNames: string[] = [];

	onMount(() => updateHeaders());

	const dispatch = createEventDispatcher();

	$: {
		if (sheet !== undefined) {
			dispatch(
				'importsettingsvalidity',
				importSettings.groupRowsByColumn !== undefined &&
					importSettings.nameColumn !== undefined &&
					importSettings.surenamesColumn !== undefined &&
					importSettings.originColumn !== undefined &&
					importSettings.courtColumn !== undefined &&
					importSettings.academicCentreColumn !== undefined
			);
		}
	}

	function updateHeaders() {
		if (sheet === undefined) return;
		if (importSettings.firstRowIsHeader) {
			columnNames = sheet.firstRow;
		} else {
			columnNames = createSheetColumns(sheet.firstRow.length);
		}
	}
</script>

{#if sheet !== undefined && !sheet.empty}
	<form>
		<label class="my-4 flex items-center space-x-2">
			<input
				name="importSettings"
				class="checkbox"
				type="checkbox"
				bind:checked={importSettings.firstRowIsHeader}
				on:change={updateHeaders}
			/>
			<p>{m.examinees_import_indicate_first_row_is_header()}</p>
		</label>

		<div class="w-full space-y-4 my-4">
			<div class="input-group input-group-divider grid-cols-[auto_1fr_auto]">
				<div class="input-group-shim">{m.examinees_import_indicate_column_to_group()}</div>
				<select required bind:value={importSettings.groupRowsByColumn}>
					{#each columnNames as column, i (column)}
						<option value={i}>{column}</option>
					{/each}
				</select>
				<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
			</div>
		</div>

		<p class="my-4 text-xl">{m.examinees_import_indicate_assign_columns_to_fields()}</p>
		<div class="my-4 input-group input-group-divider grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">{m.name()}</div>
			<select required bind:value={importSettings.nameColumn}>
				{#each columnNames as column, i (column)}
					<option value={i}>{column}</option>
				{/each}
			</select>
			<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
		</div>

		<div class="my-4 input-group input-group-divider grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">{m.surenames()}</div>
			<select required bind:value={importSettings.surenamesColumn}>
				{#each columnNames as column, i (column)}
					<option value={i}>{column}</option>
				{/each}
			</select>
			<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
		</div>

		<div class="my-4 input-group input-group-divider grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">{m.origin()}</div>
			<select required bind:value={importSettings.originColumn}>
				{#each columnNames as column, i (column)}
					<option value={i}>{column}</option>
				{/each}
			</select>
			<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
		</div>

		<div class="my-4 input-group input-group-divider grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">{m.court()}</div>
			<select required bind:value={importSettings.courtColumn}>
				{#each columnNames as column, i (column)}
					<option value={i}>{column}</option>
				{/each}
			</select>
			<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
		</div>

		<div class="my-4 input-group input-group-divider grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">{m.academic_centre()}</div>
			<select required bind:value={importSettings.academicCentreColumn}>
				{#each columnNames as column, i (column)}
					<option value={i}>{column}</option>
				{/each}
			</select>
			<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
		</div>

		<div class="my-4 input-group input-group-divider grid-cols-[auto_1fr_auto]">
			<div class="input-group-shim">{m.subject()}</div>
			<select required bind:value={importSettings.subjectNameColumn}>
				{#each columnNames as column, i (column)}
					<option value={i}>{column}</option>
				{/each}
			</select>
			<!--<div class="variant-ghost-success"><i class="fa-solid fa-check" /></div>-->
		</div>
	</form>
{:else}
	<aside class="alert variant-ghost-error">
		<i class="fa-solid fa-circle-exclamation text-4xl" />
		<div class="alert-message">
			<h3 class="h3">{m.examinees_import_indicate_no_data()}</h3>
			<p>{m.examinees_import_indicate_select_sheet_with_data()}</p>
		</div>
	</aside>
{/if}
