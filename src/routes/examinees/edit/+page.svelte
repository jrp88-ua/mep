<script lang="ts">
	import { goto } from '$app/navigation';
	import { appState } from '$lib/models/appState';
	import { ExamineeForCreate, type Examinee } from '$lib/models/examinees';
	import { getExaminee, updatedExaminee } from '$lib/services/examinees';
	import { showErrorToast, showSuccessToast } from '$lib/toast';
	import { getToastStore } from '@skeletonlabs/skeleton';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';

	const toastStore = getToastStore();
	let examinee: Examinee;

	onMount(() => {
		const id = appState.getEdittingExaminee();
		if (id === undefined) {
			requestAnimationFrame(() => goto('/examinees'));
			return;
		}
		let oexaminee = get(getExaminee(id));
		if (oexaminee === undefined) {
			requestAnimationFrame(() => goto('/examinees'));
			return;
		}
		examinee = oexaminee!;
	});

	onDestroy(() => appState.setEdittingExaminee(undefined));

	function submitForm(e: SubmitEvent) {
		const raw = Object.fromEntries(new FormData(e.target as HTMLFormElement));
		const result = ExamineeForCreate.safeParse(raw);
		if (!result.success) {
			toastStore.trigger(
				showErrorToast({
					title: 'No se ha guardado el examinado',
					message: 'Los valores son inválidos'
				})
			);
			console.error(result.error);
			return;
		}

		const values = result.data;

		// TODO set values

		updatedExaminee(examinee.id);
		toastStore.trigger(showSuccessToast({ message: 'Examinado actualizado' }));
		requestAnimationFrame(() => goto('/examinees'));
	}
</script>

<h1 class="text-3xl mb-4">
	Editando examinado <i>{examinee?.surenames}, {examinee?.name} ({examinee?.nif})</i>
</h1>
<form class="card" method="post" on:submit|preventDefault={submitForm}>
	<h2 class=" card-header text-2xl">
		Edita los valores del examinado <i>{examinee?.surenames}, {examinee?.name} ({examinee?.nif})</i>
	</h2>
	<div class="p-4">TODO</div>
	<div class="card-footer">
		<button type="submit" class="btn variant-filled-primary">
			<i class="fa-solid fa-floppy-disk" />
			<span>Guardar</span>
		</button>
		<a href="/examinees" class="btn variant-filled-tertiary">
			<i class="fa-solid fa-xmark" />
			<span>Cancelar</span>
		</a>
	</div>
</form>
