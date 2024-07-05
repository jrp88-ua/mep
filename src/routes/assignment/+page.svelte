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
	import { get } from 'svelte/store';
	import { IndividualExamConfiguration } from '$lib/assignment/individualExamConfiguration';
	import { CollidingExamsConfiguration } from '$lib/assignment/collidingExamsConfiguration';
	import { ipc_invoke_result } from '$lib/ipc';
	import { open } from '@tauri-apps/api/dialog';
	import type { ExportAssignmentError } from '$lib/types/generated/ExportAssignmentError';

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

	function nameExtractor(v: { name: String; surenames: String }) {
		return v.surenames + ',' + v.name;
	}

	async function exportAssignment() {
		const assign = get(assignment);
		if (assign === undefined) return;
		const path = await open({
			directory: true,
			multiple: false
		});
		if (Array.isArray(path) || path === null) return;

		const allDistributions = assign.exams
			.map((v) => {
				if (v instanceof IndividualExamConfiguration) return [v];
				if (v instanceof CollidingExamsConfiguration) return v.exams;
				throw new Error('unknown type: ' + JSON.stringify(v));
			})
			.reduce((accumulator, current) => accumulator.concat(current), [])
			.reduce((accumulator, configuration) => {
				const specialists = configuration.distribution!.specialists.map(nameExtractor).join('\n');
				const classrooms = configuration
					.distribution!.distribution.map((distribution) => {
						const vigilants = distribution.vigilants.map(nameExtractor).join('\n');
						const examinees = distribution.examinees
							.map((examinee) => `${examinee.nif} - ${nameExtractor(examinee)}`)
							.join('\n');
						const classroom =
							distribution.classroom.code +
							(distribution.classroom.locationCode
								? `(${distribution.classroom.locationCode})`
								: '');
						return (
							classroom +
							'\n' +
							m.exported_vigilants() +
							'\n' +
							vigilants +
							'\n' +
							'\n' +
							m.exported_examinees() +
							'\n' +
							examinees
						);
					})
					.join('\n\n');

				const contents =
					configuration.subject.name +
					'\n' +
					'\n' +
					m.exported_specialists() +
					'\n' +
					specialists +
					'\n' +
					'\n' +
					m.exported_classrooms() +
					'\n' +
					classrooms;
				accumulator.set(configuration.subject.name, contents);
				return accumulator;
			}, new Map<string, string>());

		const result = await ipc_invoke_result<void, ExportAssignmentError>('export_assignment', {
			path,
			assignment: allDistributions
		});
		if (result.success) {
			showSuccessToast(toastStore, {
				message: m.exported_assignation()
			});
		} else {
			const title = m.could_not_export_assignment_title();
			let message = m.could_not_export_assignment_unknown_error();
			switch (result.error.type) {
				case 'createDirectories':
					message = m.could_not_export_assignment_could_not_create_directory({
						path: result.error.path
					});
					break;
				case 'createFile':
					message = m.could_not_export_assignment_could_not_create_file({
						file: result.error.file
					});
					break;
				case 'writeFile':
					message = m.could_not_export_assignment_could_not_write_file({ file: result.error.file });
					break;
			}
			showErrorToast(toastStore, { title, message });
		}
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
	<button
		class="btn variant-filled-primary"
		disabled={$assignment === undefined}
		on:click={exportAssignment}
	>
		{m.export_assignment()}
	</button>
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
