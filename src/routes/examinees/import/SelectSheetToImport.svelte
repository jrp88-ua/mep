<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

	export let sheets: string[];
	export let selectedSheet: string | undefined = undefined;

	const dispatch = createEventDispatcher();

	function handleChange(e: Event) {
		dispatch('sheetselected', selectedSheet);
	}
</script>

<select bind:value={selectedSheet} class="select" size={sheets.length} on:change={handleChange}>
	{#each sheets as sheet (sheet)}
		<option value={sheet}>{sheet}</option>
	{/each}
</select>
