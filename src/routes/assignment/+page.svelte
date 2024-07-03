<script lang="ts">
	import * as m from '$paraglide/messages';

	import { assignment } from '$lib/assignment/assign';
	import { classroomsStore } from '$lib/models/classroom';
	import { examineesStore } from '$lib/models/examinees';
	import { subjectsStore } from '$lib/models/subjects';
	import { vigilantsStore } from '$lib/models/vigilant';
	import { showErrorToast } from '$lib/toast';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import AssignmentDisplay from './AssignmentDisplay.svelte';

	const toastStore = getToastStore();

	async function newAssignation() {
		const result = await assignment.createNew();
		if (result === true) return;
		let message = '';
		switch (result.type) {
			case 'missing-exam-date':
				showErrorToast(toastStore, {
					message: m.assignment_error_message_missing_exam_date({ subject: result.subject.name })
				});
				return;
			case 'not-enough-seats':
				message = m.assignment_error_message_not_enough_seats({ subject: result.subject.name });
				break;
			case 'not-enough-vigilants':
				message = m.assignment_error_message_not_enough_vigilants({ subject: result.subject.name });
				break;
			case 'no-classrooms':
				message = m.assignment_error_message_no_classrooms();
				break;
			case 'not-enough-classrooms':
				message = m.assignment_error_message_not_enough_classrooms({
					subjects: result.subjects.map((subject) => subject.name).join(', ')
				});
				break;
			case 'missing-specialist':
				message = m.missing_specialist({ subject: result.subject.name });
				break;
		}
		showErrorToast(toastStore, {
			title: m.assignment_error_title(),
			message
		});
		assignment.useEmptyAssignment();
	}

	$: hasValues =
		$examineesStore.size > 0 &&
		$classroomsStore.size > 0 &&
		$subjectsStore.size > 0 &&
		$vigilantsStore.size > 0;
</script>

<h1 class="text-3xl mb-4">Asignación</h1>
{#if $assignment}
	<a href="/assignment/edit" class="btn variant-filled-primary">Editar asignación</a>
	<AssignmentDisplay />
{:else}
	{#if !hasValues}
		<div class="alert variant-filled-error">
			<div class="alert-message">
				{#if $examineesStore.size === 0}
					<p><strong>Sin examinados</strong></p>
				{/if}
				{#if $classroomsStore.size === 0}
					<p><strong>Sin clases</strong></p>
				{/if}
				{#if $subjectsStore.size === 0}
					<p><strong>Sin asignaturas</strong></p>
				{/if}
				{#if $vigilantsStore.size === 0}
					<p><strong>Sin vigilantes</strong></p>
				{/if}
			</div>
		</div>
	{/if}
	<div class="p-4">
		<button class="btn variant-filled-primary" on:click={newAssignation} disabled={!hasValues}>
			Nueva asignación
		</button>
	</div>
{/if}
