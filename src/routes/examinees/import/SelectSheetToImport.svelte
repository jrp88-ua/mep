<script lang="ts">
	import type { ExcelSheet } from '$lib/types/sheetsImport';
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
		selectedOption =
			sheet.values.length > 0 ? SelectedOption.SELECTED_OK : SelectedOption.SELECTED_NO_VALUES;
		dispatch('sheetselected', { name: selectedSheet, valid: sheet.values.length > 0 });
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
			<h3 class="h3">Sin datos</h3>
			<p>La hoja seleccionada no parece tener datos</p>
		</div>
	</aside>
</div>
