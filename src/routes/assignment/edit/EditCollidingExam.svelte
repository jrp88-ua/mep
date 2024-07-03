<script lang="ts">
	import type { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';
	import type { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import type { Classroom } from '$lib/models/classroom';
	import type { Vigilant } from '$lib/models/vigilant';
	import EditIndividualExam from './EditIndividualExam.svelte';

	export let exam: CollidingExamsConfiguration;
	export let availableVigilants: Vigilant[];
	export let availableClassrooms: Classroom[];

	let editors: EditIndividualExam[] = [];
	export function performSave() {
		editors.forEach((editor) => editor.performSave());
	}

	function onSelectedVigilant(
		event: CustomEvent<{ vigilant: Vigilant; exam: IndividualExamConfiguration }>
	) {
		const { exam, vigilant } = event.detail;
		editors.forEach((editor) => {
			if (editor.getExam() === exam) return;
			editor.deselectVigilant(vigilant);
		});
	}

	function onSelectedClassroom(
		event: CustomEvent<{ classroom: Classroom; exam: IndividualExamConfiguration }>
	) {
		const { exam, classroom } = event.detail;
		editors.forEach((editor) => {
			if (editor.getExam() === exam) return;
			editor.deselectClassroom(classroom);
		});
	}
</script>

<div class="card mb-4">
	<header class="card-header text-3xl">Grupo de asignaturas</header>
	<section class="p-4 flex flex-col">
		{#each exam.exams as individualExam, i (individualExam.subject.id)}
			<EditIndividualExam
				exam={individualExam}
				{availableClassrooms}
				{availableVigilants}
				on:selected-classroom={onSelectedClassroom}
				on:selected-vigilant={onSelectedVigilant}
				bind:this={editors[i]}
			/>
		{/each}
	</section>
</div>
