<script lang="ts">
	import { assignment } from '$lib/assignment/assign';
	import { ProgressRadial } from '@skeletonlabs/skeleton';
	import IndividualExamDisplay from './IndividualExamDisplay.svelte';
	import { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import { derived } from 'svelte/store';
	import { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';

	const configuration = derived(assignment.parts(), (parts) => parts!);
</script>

{#if typeof $configuration !== 'string'}
	{#each $configuration as item, i (i)}
		{#if item instanceof IndividualExamConfiguration}
			<IndividualExamDisplay exam={item} />
		{:else if item instanceof CollidingExamsConfiguration}
			colliding
		{:else}
			Desconocido
		{/if}
	{/each}
{:else}
	<div class=" flex flex-col items-center">
		<h2 class="text-2xl mb-5">Creando asignación inicial</h2>
		<ProgressRadial />
	</div>
{/if}
