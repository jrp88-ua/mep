<script lang="ts">
	import type { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';
	import EditIndividualExam from './EditIndividualExam.svelte';

	export let exam: CollidingExamsConfiguration;

	let editors: EditIndividualExam[] = [];
	export function performSave() {
		editors.forEach((editor) => editor.performSave());
	}
</script>

<div class="card mb-4">
	<header class="card-header text-3xl">Grupo de asignaturas</header>
	<section class="p-4 flex flex-col">
		{#each exam.exams as individualExam, i (individualExam.subject.id)}
			<EditIndividualExam exam={individualExam} bind:this={editors[i]} />
		{/each}
	</section>
</div>
