<script lang="ts">
	import { assignment } from '$lib/assignment/assign';
	import { classroomsStore } from '$lib/models/classroom';
	import { examineesStore } from '$lib/models/examinees';
	import { subjectsStore } from '$lib/models/subjects';
	import { vigilantsStore } from '$lib/models/vigilant';
	import AssignmentDisplay from './AssignmentDisplay.svelte';

	function newAssignation() {
		assignment.createNew();
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
