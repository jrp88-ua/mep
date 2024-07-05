<script lang="ts">
	import * as m from '$paraglide/messages';

	import type { ExcelSheet } from '$lib/types/generated/ExcelSheet';
	import { createEventDispatcher, onMount } from 'svelte';

	enum SelectedOption {
		NO_SELECTED,
		SELECTED_OK,
		SELECTED_NO_VALUES
	}

	export let sheets: ExcelSheet[];
	export let selectedSheet: string | undefined = undefined;
	let selectedOption: SelectedOption = SelectedOption.NO_SELECTED;

	const dispatch = createEventDispatcher();
	onMount(() => handleChange());

	function handleChange() {
		if (selectedSheet === undefined) {
			selectedOption = SelectedOption.NO_SELECTED;
			return;
		}
		let sheet = sheets.find((s) => s.name === selectedSheet);
		if (sheet === undefined) {
			selectedSheet = undefined;
			selectedOption = SelectedOption.NO_SELECTED;
			return;
		}
		selectedOption = sheet.empty ? SelectedOption.SELECTED_NO_VALUES : SelectedOption.SELECTED_OK;
		dispatch('sheetselected', { name: selectedSheet, valid: !sheet.empty });
	}
</script>

<select bind:value={selectedSheet} class="select" size={sheets.length} on:change={handleChange}>
	{#each sheets as sheet (sheet)}
		<option value={sheet.name}>{sheet.name}</option>
	{/each}
</select>

<div class={selectedOption === SelectedOption.SELECTED_NO_VALUES ? '' : 'hidden'}>
	<aside class="alert variant-ghost-warning">
		<i class="fa-solid fa-triangle-exclamation text-4xl" />
		<div class="alert-message">
			<h3 class="h3">{m.examinees_import_sheet_no_data()}</h3>
			<p>{m.examinees_import_sheet_has_no_data()}</p>
		</div>
	</aside>
</div>
