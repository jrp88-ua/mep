<script lang="ts">
	import * as m from '$paraglide/messages';

	import type { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';
	import IndividualExamDisplay from './IndividualExamDisplay.svelte';

	export let exam: CollidingExamsConfiguration;
</script>

<div class="card mb-4">
	<header class="card-header text-3xl">{m.subject_group()}</header>
	<section class="p-4 flex flex-col">
		{#each exam.exams as individualExam (individualExam.subject.id)}
			<IndividualExamDisplay exam={individualExam} />
		{/each}
	</section>
</div>
