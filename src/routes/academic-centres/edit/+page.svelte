<script lang="ts">
	import * as m from '$paraglide/messages';
	import { goto } from '$app/navigation';
	import { type AcademicCentre, AcademicCentreForCreate } from '$lib/models/academicCentres';
	import { appState } from '$lib/models/appState';
	import { getAcademicCentre, updatedAcademicCentre } from '$lib/services/academicCentres';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	const toastStore = getToastStore();
	let academicCentre: AcademicCentre;

	onMount(() => {
		const id = appState.getEdittingAcademicCentre();
		if (id === undefined) {
			requestAnimationFrame(() => goto('/academic-centres'));
			return;
		}
		let oacademiccentre = get(getAcademicCentre(id));
		if (oacademiccentre === undefined) {
			requestAnimationFrame(() => goto('/academic-centres'));
			return;
		}
		academicCentre = oacademiccentre!;
	});

	onDestroy(() => appState.setEdittingAcademicCentre(undefined));

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = AcademicCentreForCreate.safeParse(raw);
		if (!result.success) {
			showErrorToast(toastStore, {
				title: m.could_not_save_academic_centre(),
				message: m.values_are_invalid()
			});
			console.error(result.error);
			return;
		}

		const values = result.data;

		academicCentre.setName(values.name);

		updatedAcademicCentre(academicCentre.id);
		showSuccessToast(toastStore, { message: m.academic_centre_updated() });
		requestAnimationFrame(() => goto('/academic-centres'));
	}
</script>

<h1 class="text-3xl mb-4">{m.editing_academic_centre_values({ name: academicCentre?.name })}</h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">
		{m.edit_the_values_of_the_academic_centre({ name: academicCentre?.name })}
	</h2>
	<div class="p-4">
		<label class="my-5">
			<span class="text-xl">{m.name()}</span>
			<input
				class="input"
				title={m.name()}
				name="name"
				type="text"
				value={academicCentre?.name || ''}
				placeholder={m.name_of_the_academic_centre()}
				required
			/>
		</label>
	</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>{m.save()}</span>
		</button>
		<a href="/academic-centres" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>{m.cancel()}</span>
		</a>
	</div>
</form>
