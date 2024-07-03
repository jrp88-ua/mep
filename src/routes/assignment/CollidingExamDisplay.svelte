<script lang="ts">
	import type { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';
	import IndividualExamDisplay from './IndividualExamDisplay.svelte';

	export let exam: CollidingExamsConfiguration;
</script>

<div class="card mb-4">
	<header class="card-header text-3xl">Grupo de asignaturas</header>
	<section class="p-4 flex flex-col">
		{#each exam.exams as individualExam (individualExam.subject.id)}
			<IndividualExamDisplay exam={individualExam} />
		{/each}
	</section>
</div>
