<script lang="ts">
	import { assignment } from '$lib/assignment/assign';
	import { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import { routeTo } from '$lib/util';
	import { onMount } from 'svelte';
	import { derived, get } from 'svelte/store';
	import EditIndividualExam from './EditIndividualExam.svelte';
	import { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';

	onMount(() => {
		if (get(assignment) === undefined) routeTo('/assignment');
	});

	const configuration = derived(assignment, (v) => v!);
</script>

<h1 class="text-3xl mb-4">Editar asignación</h1>
<div class="p-4 flex flex-col gap-2">
	{#each $configuration.exams as exam}
		{#if exam instanceof IndividualExamConfiguration}
			<EditIndividualExam {exam} />
		{:else if exam instanceof CollidingExamsConfiguration}
			TODO
		{:else}
			Desconocido
		{/if}
	{/each}
</div>
