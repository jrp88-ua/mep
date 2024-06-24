<script lang="ts">
	import * as m from '$paraglide/messages';

	import { assignment } from '$lib/assignment/assign';
	import { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import { routeTo } from '$lib/util';
	import { onMount } from 'svelte';
	import { derived, get } from 'svelte/store';
	import EditIndividualExam from './EditIndividualExam.svelte';
	import { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';
	import { showSuccessToast } from '$lib/toast';
	import { getToastStore } from '@skeletonlabs/skeleton';

	const toastStore = getToastStore();

	onMount(() => {
		if (get(assignment) === undefined) routeTo('/assignment');
	});

	const configuration = derived(assignment, (v) => v!);
	let editors: EditIndividualExam[] = [];

	function saveAssignation() {
		editors.forEach((editor) => editor.performSave());
		routeTo('/assignment');
		showSuccessToast(toastStore, {
			message: 'Asignación actualizada'
		});
	}
</script>

<h1 class="text-3xl mb-4">Editar asignación</h1>
<button class="btn variant-filled-primary" on:click={() => saveAssignation()}>
	<i class="fa-solid fa-floppy-disk" />
	<span>{m.save()}</span>
</button>
<a href="/assignment" class="btn variant-filled-tertiary">
	<i class="fa-solid fa-xmark" />
	<span>{m.cancel()}</span>
</a>
<div class="p-4 flex flex-col gap-2">
	{#each $configuration.exams as exam, i}
		{#if exam instanceof IndividualExamConfiguration}
			<EditIndividualExam {exam} bind:this={editors[i]} />
		{:else if exam instanceof CollidingExamsConfiguration}
			TODO
		{:else}
			Desconocido
		{/if}
	{/each}
</div>
