<script lang="ts">
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
			toastStore.trigger(
				showErrorToast({
					title: 'No se ha guardado el centro académico',
					message: 'Los valores son inválidos'
				})
			);
			console.error(result.error);
			return;
		}

		const values = result.data;

		// TODO set values

		updatedAcademicCentre(academicCentre.id);
		toastStore.trigger(showSuccessToast({ message: 'Centro académico actualizado' }));
		requestAnimationFrame(() => goto('/academic-centres'));
	}
</script>

<h1 class="text-3xl mb-4">Editando centro académico <i>{academicCentre?.name}</i></h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">
		Edita los valores del centro académico <i>{academicCentre?.name}</i>
	</h2>
	<div class="p-4">TODO</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>Guardar</span>
		</button>
		<a href="/academic-centres" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
