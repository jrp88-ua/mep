<script lang="ts">
	import * as m from '$paraglide/messages';
	import { getAllSubjects } from '$lib/services/subjects';

	const subjectsStore = getAllSubjects();

	let group: number[] = [];

	export function getSelection() {
		return group;
	}
</script>

<div class="my-5">
	<span class="text-xl">{m.subjects()}</span>
	{#if $subjectsStore.length === 0}
		<br />
		<i>{m.no_registered_subjects()}</i>
	{:else}
		<fieldset class="my-1 grid grid-cols-3 gap-4">
			{#each $subjectsStore as subject}
				<label>
					<input
						bind:group
						type="checkbox"
						class="checkbox"
						name="selectedSubjects"
						value={subject.id}
					/>
					<span>{subject.name}</span>
				</label>
			{/each}
		</fieldset>
	{/if}
</div>
