<script lang="ts">
	import * as m from '$paraglide/messages';
	import { findAcademicCentreByName, getAllAcademicCentres } from '$lib/services/academicCentres';
	import { popup } from '@skeletonlabs/skeleton';
	import type { AcademicCentre } from '$lib/models/academicCentres';

	const academicCentresStore = getAllAcademicCentres();

	const allAcademicCentres = $academicCentresStore;

	let academicCentreName = '';
	let matchingAcademicCentre: AcademicCentre | undefined = undefined;
	function checkName(event: Event & { currentTarget: EventTarget & HTMLInputElement }) {
		doCheckName(event.currentTarget.value);
	}

	function doCheckName(name: string) {
		if (name.trim() === '') {
			matchingAcademicCentre = undefined;
			return;
		}
		matchingAcademicCentre = findAcademicCentreByName(name);
	}

	export function setName(name: string) {
		academicCentreName = name;
		doCheckName(name);
	}

	export function getName() {
		return academicCentreName;
	}

	export function academicCentreExists() {
		return matchingAcademicCentre !== undefined;
	}

	$: showWarning = matchingAcademicCentre === undefined && academicCentreName.trim() !== '';
</script>

<label class="my-5">
	<span class="text-xl">{m.academic_centre_field()}</span>
	<div class="input-group input-group-divider grid-cols-[auto_1fr]">
		{#if showWarning}
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
			on:input={checkName}
		/>
	</div>
</label>
<datalist id="all-academic-centres">
	{#each allAcademicCentres as ac (ac.id)}
		<option value={ac.name}>{ac.id}</option>
	{/each}
</datalist>
<div
	class="card p-4 variant-filled-surface"
	data-popup="academic-centre-warning"
	style={showWarning ? 'display: none;' : ''}
>
	<p><strong>{m.academic_centre_field_warning_title()}</strong></p>
	<p>
		{m.academic_centre_field_warning_message({ name: academicCentreName })}
	</p>
</div>
