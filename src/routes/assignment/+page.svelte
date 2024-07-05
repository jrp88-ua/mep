<script lang="ts">
	import * as m from '$paraglide/messages';

	import { assignment } from '$lib/assignment/assign';
	import { classroomsStore } from '$lib/models/classroom';
	import { examineesStore } from '$lib/models/examinees';
	import { subjectsStore } from '$lib/models/subjects';
	import { vigilantsStore } from '$lib/models/vigilant';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getModalStore, getToastStore } from '@skeletonlabs/skeleton';
	import AssignmentDisplay from './AssignmentDisplay.svelte';
	import { showActionWillDeleteAssignment } from '../actionWillDeleteAssignment';

	const toastStore = getToastStore();
	const modalStore = getModalStore();

	async function doAssignation() {
		const results = await assignment.createNew();
		if (results === true) return;

		const message = results.map((result) => {
			switch (result.type) {
				case 'missing-exam-date':
					return m.assignment_error_message_missing_exam_date({ subject: result.subject.name });
				case 'not-enough-seats':
					return m.assignment_error_message_not_enough_seats({ subject: result.subject.name });
				case 'not-enough-vigilants':
					return m.assignment_error_message_not_enough_vigilants({ subject: result.subject.name });
				case 'no-classrooms':
					return m.assignment_error_message_no_classrooms();
				case 'not-enough-classrooms':
					return m.assignment_error_message_not_enough_classrooms({
						subjects: result.subjects.map((subject) => subject.name).join(', ')
					});
				case 'missing-specialist':
					return m.missing_specialist({ subject: result.subject.name });
			}
		});

		if (message.length > 0) {
			showErrorToast(toastStore, {
				title: m.assignment_error_title(),
				message
			});
		} else {
			showSuccessToast(toastStore, {
				message: m.assignment_made()
			});
		}
	}

	async function newAssignation() {
		if (!(await showActionWillDeleteAssignment(modalStore))) return;
		doAssignation();
	}

	$: hasValues =
		$examineesStore.size > 0 &&
		$classroomsStore.size > 0 &&
		$subjectsStore.size > 0 &&
		$vigilantsStore.size > 0;
</script>

<h1 class="text-3xl mb-4">{m.assignment_page_title()}</h1>
{#if $assignment}
	<a href="/assignment/edit" class="btn variant-filled-primary">{m.edit_assignment()}</a>
	<button class="btn variant-filled-primary" on:click={newAssignation} disabled={!hasValues}>
		{m.new_assignment()}
	</button>
	<AssignmentDisplay />
{:else}
	{#if !hasValues}
		<div class="alert variant-filled-error">
			<div class="alert-message">
				{#if $examineesStore.size === 0}
					<p><strong>{m.no_examinees()}</strong></p>
				{/if}
				{#if $classroomsStore.size === 0}
					<p><strong>{m.no_classrooms()}</strong></p>
				{/if}
				{#if $subjectsStore.size === 0}
					<p><strong>{m.no_subjects()}</strong></p>
				{/if}
				{#if $vigilantsStore.size === 0}
					<p><strong>{m.no_vigilants()}</strong></p>
				{/if}
			</div>
		</div>
	{/if}
	<div class="p-4">
		<button class="btn variant-filled-primary" on:click={newAssignation} disabled={!hasValues}>
			{m.new_assignment()}
		</button>
	</div>
{/if}
