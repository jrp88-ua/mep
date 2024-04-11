<script lang="ts">
	import * as m from '$paraglide/messages';
	import { findAcademicCentreByName, getAllAcademicCentres } from '$lib/services/academicCentres';
	import { popup } from '@skeletonlabs/skeleton';

	const academicCentresStore = getAllAcademicCentres();

	const allAcademicCentres = $academicCentresStore;

	export let academicCentreName = '';
	let showAcademicCentreWarning = false;
	let checkAcademicCentreTask: string | number | NodeJS.Timeout | undefined = undefined;
	function checkAcademicCentre(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		clearTimeout(checkAcademicCentreTask);
		let value = event.currentTarget.value.trim();
		if (!value) {
			showAcademicCentreWarning = false;
			return;
		}
		checkAcademicCentreTask = setTimeout(() => {
			showAcademicCentreWarning = findAcademicCentreByName(value) === undefined;
		}, 500);
	}

	export function academicCentreExists() {
		return !showAcademicCentreWarning;
	}
</script>

<label class="my-5">
	<span class="text-xl">{m.academic_centre_field()}</span>
	<div class="input-group input-group-divider grid-cols-[auto_1fr]">
		{#if showAcademicCentreWarning}
			<div
				class="input-group-shim"
				use:popup={{
					event: 'hover',
					target: 'academic-centre-warning',
					placement: 'top-start'
				}}
			>
				<i class="fa-solid fa-circle-exclamation text-warning-500 animate-pulse" />
			</div>
		{/if}
		<input
			title={m.academic_centre_field()}
			name="academicCentre"
			type="text"
			placeholder={m.academic_centre_field_placeholder()}
			list="all-academic-centres"
			bind:value={academicCentreName}
			on:input={checkAcademicCentre}
		/>
	</div>
</label>
<datalist id="all-academic-centres">
	{#each allAcademicCentres as ac (ac.id)}
		<option value={ac.name}>{ac.id}</option>
	{/each}
</datalist>
<div class="card p-4 variant-filled-surface" data-popup="academic-centre-warning">
	<p><strong>{m.academic_centre_field_warning_title()}</strong></p>
	<p>
		{m.academic_centre_field_warning_message({ academicCentreName })}
	</p>
</div>
